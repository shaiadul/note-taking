"use client";

import { InterestsGroupResult } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTags, IconUsers, IconUser } from "@tabler/icons-react";

interface InterestsGroupViewProps {
  groups: InterestsGroupResult[];
}

export function InterestsGroupView({ groups }: InterestsGroupViewProps) {
  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <IconTags className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Scenario 1: Group by Interests</CardTitle>
              <CardDescription className="text-xs">
                Aggregated using <strong>exactly one collection.aggregate() call</strong> with an index on{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                  interests: 1
                </code>
                .
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          No users with interests found in the database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card
              key={group._id}
              className="border-border/80 hover:border-primary/40 transition-colors flex flex-col justify-between"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
                <Badge
                  variant="outline"
                  className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 font-bold capitalize text-xs gap-1.5"
                >
                  <IconTags className="h-3 w-3" />
                  {group._id}
                </Badge>
                <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <IconUsers className="h-3.5 w-3.5" />
                  {group.totalUsers} {group.totalUsers === 1 ? "user" : "users"}
                </span>
              </CardHeader>

              <CardContent className="pt-3 space-y-2">
                {group.users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <IconUser className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{user.name}</div>
                        <div className="text-[10px] text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[9px] uppercase font-bold">
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
