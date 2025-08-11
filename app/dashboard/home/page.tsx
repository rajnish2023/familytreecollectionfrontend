"use client";
import React, { useEffect, useState } from "react";
import { API_ENDPOINTS } from '@/app/config/api';
import { authenticatedFetch } from "@/app/utils/auth";

type Person = {
  _id: string;
  name: string;
  dateOfBirth: string;
  [key: string]: any;
};

type NextBirthdayPerson = Person & { nextBirthday: Date };

function getUpcomingBirthdays(persons: Person[]): NextBirthdayPerson[] {
  const today = new Date();
  let soonestDate: Date | null = null;
  let soonestPeople: NextBirthdayPerson[] = [];
  persons.forEach((p) => {
    if (!p.dateOfBirth) return;
    const dob = new Date(p.dateOfBirth);
    dob.setFullYear(today.getFullYear());
    if (dob < today) dob.setFullYear(today.getFullYear() + 1);
    if (!soonestDate || dob.getTime() < soonestDate.getTime()) {
      soonestDate = new Date(dob);
      soonestPeople = [{ ...p, nextBirthday: new Date(dob) }];
    } else if (soonestDate && dob.getTime() === soonestDate.getTime()) {
      soonestPeople.push({ ...p, nextBirthday: new Date(dob) });
    }
  });
  return soonestPeople;
}

export default function DashboardHome() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authenticatedFetch(API_ENDPOINTS.persons.all)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPersons(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalMembers = persons.length;
  const nextBirthdays = getUpcomingBirthdays(persons);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 mb-4">
        <h1 className="text-3xl text-foreground font-semibold">Welcome to Family Tree Dashboard</h1>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-full flex flex-col justify-between">
          <div>
            <div className="text-lg font-semibold text-card-foreground mb-2">Total Family Members</div>
            <div className="text-4xl font-bold text-card-foreground">{loading ? "..." : totalMembers}</div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-full flex flex-col justify-between">
            <div className="text-lg font-semibold text-muted-foreground mb-2">Upcoming Birthday</div>
            <div className="text-2xl text-muted-foreground">...</div>
          </div>
        </div>
      ) : nextBirthdays.length > 0 ? (
        nextBirthdays.map((person) => (
          <div key={person._id} className="col-span-12 md:col-span-6 lg:col-span-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-full flex flex-col justify-between">
              <div className="text-lg font-semibold text-card-foreground mb-2">Upcoming Birthday 🥳</div>
              <div className="text-2xl font-bold text-card-foreground">{person.name}</div>
              <div className="text-muted-foreground mt-1">
                {person.nextBirthday.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Turns {person.dateOfBirth ? (new Date().getFullYear() - new Date(person.dateOfBirth).getFullYear() + (new Date(person.nextBirthday) > new Date() ? 0 : 1)) : "-"}</div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-full flex flex-col justify-between">
            <div className="text-lg font-semibold text-card-foreground mb-2">Upcoming Birthday</div>
            <div className="text-muted-foreground">No upcoming birthdays</div>
          </div>
        </div>
      )}
      {/* Add more bento cards here as needed */}
    </div>
  );
} 