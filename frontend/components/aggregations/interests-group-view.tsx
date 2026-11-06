"use client";

import { InterestsGroupResult } from "@/lib/types";
import { IconTags, IconUsers, IconUser } from "@tabler/icons-react";

interface InterestsGroupViewProps {
  groups: InterestsGroupResult[];
}

export function InterestsGroupView({ groups }: InterestsGroupViewProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-muted bg-card p-5">
        <div className="flex items-center gap-2 text-primary">
          <IconTags className="h-5 w-5 text-indigo-500" />
          <h2 className="text-base font-bold">Scenario 1: Group by Interests</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Aggregated using <strong>exactly one collection.aggregate() call</strong> with an index on{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-primary">
            interests: 1
          </code>
          .
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-muted p-8 text-center text-xs text-muted-foreground">
          No users with interests found in the database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div
              key={group._id}
              className="flex flex-col justify-between rounded-xl border border-muted bg-card p-5 shadow-xs hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-muted">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-500 capitalize">
                    <IconTags className="h-3.5 w-3.5" />
                    {group._id}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <IconUsers className="h-3.5 w-3.5" />
                    {group.totalUsers} {group.totalUsers === 1 ? "user" : "users"}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {group.users.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <IconUser className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-primary">{user.name}</div>
                          <div className="text-[10px] text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

