"use client";

import React, { useEffect, useState, useRef } from "react";
import Tree from "react-d3-tree";
import ReactDOM from "react-dom";
import { authenticatedFetch, canEdit } from "@/app/utils/auth";
import { API_ENDPOINTS } from '@/app/config/api';
import EditPersonForm from "@/components/EditPersonForm";
import { useTheme } from "@/context/ThemeContext";

type PersonNode = {
  _id: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  photo: string | null;
  occupation: string | null;
  currentAddress: string | null;
  contactNumber: string | null;
  email: string | null;
  spouse: Omit<PersonNode, "spouse" | "children"> | null;
  children: PersonNode[];
  placeOfBirth: string;
  countryCode: string;
  spouse_id: string;
};

function toTitleCase(text: string): string {
  return text
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

async function fetchFamilyTree(): Promise<PersonNode[] | null> {
  try {
    const res = await authenticatedFetch(API_ENDPOINTS.persons.familyTree);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const data = await res.json();
    return data.data as PersonNode[];
  } catch (err) {
    console.error(err);
    return null;
  }
}

function calculateTextWidth(text: string): number {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context) {
    context.font = "600 14px sans-serif";
    const textWidth = context.measureText(text).width;
    return Math.max(140, 36 + 10 + textWidth + 15 + 10);
  }
  return 140;
}

function transformNode(node: PersonNode, maxWidthRef: { current: number }): any {
  const nodeWidth = calculateTextWidth(node.name);
  maxWidthRef.current = Math.max(maxWidthRef.current, nodeWidth);

  const selfNode = {
    name: node.name,
    photo: node.photo,
    nodeWidth,
    _id: node._id,
    attributes: {
      gender: node.gender,
      dateOfBirth: node.dateOfBirth ? new Date(node.dateOfBirth).toLocaleDateString() : "Unknown",
      occupation: node.occupation || "",
      currentAddress: node.currentAddress || "",
      countryCode: node.countryCode || "+91",
      contactNumber: node.contactNumber || "",
      email: node.email || "",
    },
    children: node.children.map(child => transformNode(child, maxWidthRef)),
  };

  if (node.spouse) {
    const spouseWidth = calculateTextWidth(node.spouse.name);
    maxWidthRef.current = Math.max(maxWidthRef.current, spouseWidth);
    const spouseNode = {
      name: node.spouse.name,
      photo: node.spouse.photo,
      nodeWidth: spouseWidth,
      _id: node.spouse._id,
      attributes: {
        gender: node.spouse.gender,
        dateOfBirth: node.spouse.dateOfBirth ? new Date(node.spouse.dateOfBirth).toLocaleDateString() : "Unknown",
        occupation: node.spouse.occupation || "",
        currentAddress: node.spouse.currentAddress || "",
        countryCode: node.spouse.countryCode || "+91",
        contactNumber: node.spouse.contactNumber || "",
        email: node.spouse.email || "",
      },
      children: [],
    };

    return {
      name: '',
      children: [selfNode, spouseNode]
    };
  }

  return selfNode;
}

function transformNodes(nodes: PersonNode[], maxWidthRef: { current: number }): any {
  // Create a dummy root node to connect all trees
  const rootNode = {
    name: "Families",
    children: nodes.map(node => transformNode(node, maxWidthRef)),
    nodeWidth: 0,
    _id: "root",
    attributes: {}
  };

  return rootNode;
}

function CustomNode({ nodeDatum }: { nodeDatum: any }) {
  const [hover, setHover] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const nodeWidth = nodeDatum.nodeWidth || 140;
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const nodeRef = useRef<SVGGElement>(null);
  const { theme } = useTheme();

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHover(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setHover(false), 120);
  };

  useEffect(() => {
    if (hover && nodeRef.current) {
      const svg = nodeRef.current.ownerSVGElement;
      if (svg) {
        const pt = svg.createSVGPoint();
        pt.x = 0;
        pt.y = 0;
        const ctm = nodeRef.current.getScreenCTM();
        if (ctm) {
          const screenPos = pt.matrixTransform(ctm);
          setHoverPos({ x: screenPos.x, y: screenPos.y });
        }
      }
    } else {
      setHoverPos(null);
    }
  }, [hover]);

  const userCanEdit = canEdit();

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditOpen(true);
  };

  if (!nodeDatum.attributes && nodeDatum.name !== "Families") {
    return null;
  }

  const getAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const color = nodeDatum.name === "Families" ? "#888" : 
               nodeDatum.attributes?.gender === "Male" ? "#3B82F6" : "#EC4899";
  const xOffset = nodeWidth / 2;

  const nodeFill = theme === "dark" ? "#1a1a1a" : "#ffffff";
  const textColor = theme === "dark" ? "#ededed" : "#000000";
  const defaultAvatarFill = theme === "dark" ? "#374151" : "#f3f4f6";
  const defaultAvatarStroke = theme === "dark" ? "#6b7280" : "#d1d5db";
  const popupBg = theme === "dark" ? "#1a1a1a" : "#ffffff";
  const popupText = theme === "dark" ? "#ededed" : "#000000";
  const popupBorder = theme === "dark" ? "#374151" : "#ccc";

  const handleEditSuccess = () => {
    setEditOpen(false);
    window.location.reload();
  };

  const handleEditCancel = () => {
    setEditOpen(false);
  };

  if (nodeDatum.name === "Families") {
    return (
      <g>
        <circle r="15" fill="transparent" stroke="transparent" />
      </g>
    );
  }

  return (
    <>
      <g ref={nodeRef}>
        <g
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: "pointer" }}
        >
          <rect
            width={nodeWidth}
            height="50"
            x={-xOffset}
            y="-25"
            rx="8"
            fill={nodeFill}
            stroke={color}
            strokeWidth="1"
            filter="url(#shadow)"
          />
          {nodeDatum.photo ? (
            <image
              href={nodeDatum.photo}
              x={-xOffset + 10}
              y="-18"
              width="36"
              height="36"
              clipPath="circle(18)"
            />
          ) : (
            <circle cx={-xOffset + 28} cy="0" r="18" fill={defaultAvatarFill} stroke={defaultAvatarStroke} strokeWidth="1" />
          )}
          <text x={-xOffset + 55} y="-5" fontSize="14" fill={textColor} fontWeight="600">
            {nodeDatum.name}
          </text>
          <text x={-xOffset + 55} y="8" fontSize="12" fill={textColor}>
            Age: {getAge(nodeDatum.attributes?.dateOfBirth)}
          </text>
        </g>
      </g>
      {typeof window !== 'undefined' && hover && hoverPos && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            left: hoverPos.x + 30,
            top: hoverPos.y + 35,
            zIndex: 9999,
            background: popupBg,
            border: `1px solid ${popupBorder}`,
            borderRadius: 8,
            boxShadow: '0 4px 32px #0004',
            padding: 12,
            minWidth: nodeWidth + 30,
            pointerEvents: 'auto',
            color: popupText,
            fontSize: '12px',
            lineHeight: '1.3',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {nodeDatum.attributes && (
            <>
              {nodeDatum.attributes.gender && (
                <div style={{ marginBottom: 2, fontSize: '12px' }}>Gender: {nodeDatum.attributes.gender}</div>
              )}
              {nodeDatum.attributes.dateOfBirth && (
                <div style={{ marginBottom: 2, fontSize: '12px' }}>DOB: {nodeDatum.attributes.dateOfBirth}</div>
              )}
              {nodeDatum.attributes.occupation && (
                <div style={{ marginBottom: 2, fontSize: '12px' }}>Occupation: {nodeDatum.attributes.occupation}</div>
              )}
              {nodeDatum.attributes.contactNumber && (
                <div style={{ marginBottom: 2, fontSize: '12px' }}>📞 {nodeDatum.attributes.contactNumber}</div>
              )}
              {nodeDatum.attributes.email && (
                <div style={{ marginBottom: 2, fontSize: '12px' }}>✉ {nodeDatum.attributes.email}</div>
              )}
              {nodeDatum.attributes.currentAddress && (
                <div style={{ marginBottom: 2, fontSize: '12px' }}>
                  📍 {nodeDatum.attributes.currentAddress.substring(0, 20)}
                  {nodeDatum.attributes.currentAddress.length > 20 ? '...' : ''}
                </div>
              )}
            </>
          )}
          {userCanEdit && nodeDatum._id !== "root" && (
            <button
              onClick={handleEditClick}
              style={{
                fontSize: 12,
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid #3B82F6',
                background: theme === "dark" ? '#1e3a8a' : '#EFF6FF',
                color: theme === "dark" ? '#93c5fd' : '#1D4ED8',
                cursor: 'pointer',
                fontWeight: '500',
                marginTop: 8,
              }}
            >
              Edit
            </button>
          )}
        </div>,
        document.body
      )}
      {typeof window !== 'undefined' && editOpen && ReactDOM.createPortal(
        <EditPersonForm
          personId={nodeDatum._id}
          initialData={{
            name: nodeDatum.name || "",
            gender: nodeDatum.attributes?.gender || "",
            occupation: nodeDatum.attributes?.occupation || "",
            currentAddress: nodeDatum.attributes?.currentAddress || "",
            contactNumber: nodeDatum.attributes?.contactNumber || "",
            email: nodeDatum.attributes?.email || "",
            photo: nodeDatum.photo || "",
            countryCode: nodeDatum.attributes?.countryCode || "+91",
          }}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />,
        document.body
      )}
    </>
  );
}

export default function FamilyTreePage() {
  const [treeData, setTreeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [maxNodeWidth, setMaxNodeWidth] = useState(200);
  const { theme } = useTheme();

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    fetchFamilyTree()
      .then((trees) => {
        if (trees && trees.length) {
          const maxWidthRef = { current: 140 };
          const transformedData = transformNodes(trees, maxWidthRef);
          setTreeData(transformedData);
          setMaxNodeWidth(maxWidthRef.current + 60);
        } else {
          setError("No family trees found.");
        }
      })
      .catch(() => setError("Error loading family trees."))
      .finally(() => setLoading(false));
  }, []);

  const pathClassFunc = (linkDatum: any) => {
    // Hide links originating from the root "Families" node
    return linkDatum.source.data._id === "root" ? "hide-root-link" : "tree-link";
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold text-foreground">Family Tree</h1>
        <p className="text-muted-foreground">Loading family trees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold text-foreground">Family Tree</h1>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[90vh] border border-border rounded shadow bg-background">
      <style>{`
        .hide-root-link {
          display: none;
        }
      `}</style>
      <svg style={{ height: 0 }}>
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor={theme === "dark" ? "#000" : "#000"} floodOpacity={theme === "dark" ? "0.5" : "0.25"} />
          </filter>
        </defs>
      </svg>
      {treeData && (
        <Tree
          data={treeData}
          translate={{ x: window.innerWidth / 2, y: 100 }}
          zoomable
          collapsible
          orientation="vertical"
          pathFunc="step"
          renderCustomNodeElement={(rd3tProps) => <CustomNode {...rd3tProps} />}
          nodeSize={{ x: maxNodeWidth, y: 120 }}
          separation={{ siblings: 0.8, nonSiblings: 1.2 }}
          // initialDepth={1}
          scaleExtent={{ min: 0.1, max: 2 }}
          zoom={0.6}
          pathClassFunc={pathClassFunc}
        />
      )}
    </div>
  );
}