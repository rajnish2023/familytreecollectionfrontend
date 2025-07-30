import React from 'react';

interface IconProps {
  className?: string;
}

export const ChevronRightIcon = (props: any) => (
  <svg
    className={props.className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.5 5L12.5 10L7.5 15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.5 15L7.5 10L12.5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 4.16667C5.83333 4.16667 2.275 6.66667 0.833333 10C2.275 13.3333 5.83333 15.8333 10 15.8333C14.1667 15.8333 17.725 13.3333 19.1667 10C17.725 6.66667 14.1667 4.16667 10 4.16667ZM10 13.75C7.93333 13.75 6.25 12.0667 6.25 10C6.25 7.93333 7.93333 6.25 10 6.25C12.0667 6.25 13.75 7.93333 13.75 10C13.75 12.0667 12.0667 13.75 10 13.75ZM10 7.91667C8.84167 7.91667 7.91667 8.84167 7.91667 10C7.91667 11.1583 8.84167 12.0833 10 12.0833C11.1583 12.0833 12.0833 11.1583 12.0833 10C12.0833 8.84167 11.1583 7.91667 10 7.91667Z"
      fill="currentColor"
    />
  </svg>
);

export const EyeCloseIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 4.16667C5.83333 4.16667 2.275 6.66667 0.833333 10C2.275 13.3333 5.83333 15.8333 10 15.8333C14.1667 15.8333 17.725 13.3333 19.1667 10C17.725 6.66667 14.1667 4.16667 10 4.16667ZM10 13.75C7.93333 13.75 6.25 12.0667 6.25 10C6.25 7.93333 7.93333 6.25 10 6.25C12.0667 6.25 13.75 7.93333 13.75 10C13.75 12.0667 12.0667 13.75 10 13.75ZM10 7.91667C8.84167 7.91667 7.91667 8.84167 7.91667 10C7.91667 11.1583 8.84167 12.0833 10 12.0833C11.1583 12.0833 12.0833 11.1583 12.0833 10C12.0833 8.84167 11.1583 7.91667 10 7.91667Z"
      fill="currentColor"
    />
    <path
      d="M2.5 2.5L17.5 17.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const AddIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

export const HorizontaLDots = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
    />
  </svg>
);

export const MailIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2.5 4.5L10 11L17.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TreeIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Root Node */}
    <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" fill="white" />

    {/* Child Nodes */}
    <circle cx="6" cy="16" r="2" stroke="currentColor" strokeWidth="1.5" fill="white" />
    <circle cx="18" cy="16" r="2" stroke="currentColor" strokeWidth="1.5" fill="white" />

    {/* Connectors */}
    <line x1="11.2" y1="5.6" x2="6.8" y2="13.2" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12.8" y1="5.6" x2="17.2" y2="13.2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
); 