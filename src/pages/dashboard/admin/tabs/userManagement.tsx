// UserManagement.tsx
import React, { useEffect, useMemo, useState } from "react";
import { supabaseAdmin } from "../../../../lib/superbase";
import { Loader2, Search, RefreshCcw, User, Shield, Calendar, Mail, Clock } from "lucide-react";
import styles from "./userManagement.module.css";

type Program = {
    id: string;
    title: string | null;
    description?: string | null;
};

type Enrollment = {
    id: string;
    program_id: string;
    enrollment_date: string | null;
    completion_date: string | null;
    cost: number | null;
    payment_status: string | null;
    progress_percentage: number | null;
    is_active: boolean | null;
    programs: Program | null; // joined
};


export type Profile = {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
    created_at: string;
    updated_at: string;
    last_seen_at: string | null;
};

type ActivityFilter = "all" | "online" | "active_3d" | "active_30d" | "never_seen";

const fmtDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
};

const withinMinutes = (iso: string | null, minutes: number) => {
    if (!iso) return false;
    const then = new Date(iso).getTime();
    const cutoff = Date.now() - minutes * 60 * 1000;
    return then >= cutoff;
};

const withinDays = (iso: string | null, days: number) => {
    if (!iso) return false;
    const then = new Date(iso).getTime();
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return then >= cutoff;
};

const shortId = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;

const UserManagement: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [selected, setSelected] = useState<Profile | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [activityFilter, setActivityFilter] = useState<ActivityFilter>("active_30d");

    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
    const [enrollmentsError, setEnrollmentsError] = useState<string | null>(null);


    const loadProfiles = async () => {
        setIsLoading(true);
        setErrorMsg(null);

        // If you have a lot of users, switch this to server-side pagination later.
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select("id,email,full_name,avatar_url,role,created_at,updated_at,last_seen_at")
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            setErrorMsg(error.message);
            setProfiles([]);
            setSelected(null);
            setIsLoading(false);
            return;
        }

        const rows = (data ?? []) as Profile[];
        setProfiles(rows);

        const first = rows[0] ?? null;
        if (!selected && first) {
            setSelected(first);
            loadEnrollmentsForUser(first.id);
        }


        // Keep selection stable after refresh
        setSelected((prev) => {
            if (!prev) return rows[0] ?? null;
            return rows.find((p) => p.id === prev.id) ?? prev;
        });

        setIsLoading(false);
    };

    useEffect(() => {
        loadProfiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadEnrollmentsForUser = async (userId: string) => {
        setEnrollmentsLoading(true);
        setEnrollmentsError(null);

        const { data, error } = await supabaseAdmin
            .from("program_enrollments")
            .select(`
            id,
            program_id,
            enrollment_date,
            completion_date,
            cost,
            payment_status,
            progress_percentage,
            is_active,
            programs (
              id,
              title
            )
          `)
            .eq("user_id", userId)
            .order("enrollment_date", { ascending: false });

        if (error) {
            console.error(error);
            setEnrollments([]);
            setEnrollmentsError(error.message);
            setEnrollmentsLoading(false);
            return;
        }

        setEnrollments((data ?? []) as unknown as Enrollment[]);
        setEnrollmentsLoading(false);
    };


    const filteredProfiles = useMemo(() => {
        const q = search.trim().toLowerCase();

        let list = profiles;

        // search
        if (q) {
            list = list.filter((p) => {
                const email = (p.email ?? "").toLowerCase();
                const name = (p.full_name ?? "").toLowerCase();
                const id = p.id.toLowerCase();
                return email.includes(q) || name.includes(q) || id.includes(q);
            });
        }

        // activity filter (based on last_seen_at)
        switch (activityFilter) {
            case "online":
                // "currently active" = seen in last 10 minutes
                return list.filter((p) => withinMinutes(p.last_seen_at, 10));
            case "active_3d":
                return list.filter((p) => withinDays(p.last_seen_at, 3));
            case "active_30d":
                return list.filter((p) => withinDays(p.last_seen_at, 30));
            case "never_seen":
                return list.filter((p) => !p.last_seen_at);
            default:
                return list;
        }
    }, [profiles, search, activityFilter]);

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 style={{ background: "transparent" }}>User Management</h1>
                    <div className={styles.subHeader}>
                        Showing <b>{filteredProfiles.length}</b> of <b>{profiles.length}</b>
                    </div>
                </div>

                <div className={styles.headerActions}>
                    <button
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onClick={loadProfiles}
                        disabled={isLoading}
                        title="Refresh"
                    >
                        {isLoading ? <Loader2 className={styles.spinner} size={16} /> : <RefreshCcw size={16} />}
                        Refresh
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className={styles.panel}>
                <div className={styles.searchBar}>
                    <div className={styles.searchWrap}>
                        <Search size={16} />
                        <input
                            className={styles.searchInput}
                            placeholder="Search by email, name, or user id…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className={styles.filterSelect}
                        value={activityFilter}
                        onChange={(e) => setActivityFilter(e.target.value as ActivityFilter)}
                    >
                        <option value="active_30d">Active (last 30 days)</option>
                        <option value="active_3d">Active (last 3 days)</option>
                        <option value="online">Currently active (10 min)</option>
                        <option value="never_seen">Never seen</option>
                        <option value="all">All users</option>
                    </select>
                </div>

                {errorMsg && (
                    <div className={styles.errorBox}>
                        ⚠ {errorMsg}
                        <div className={styles.hint}>
                            If you expected to see all users but only see 1, that’s RLS — your admin policy isn’t applied for the logged-in user.
                        </div>
                    </div>
                )}
            </div>

            {/* Layout */}
            <div className={styles.grid}>
                {/* Left: list */}
                <div className={styles.listPanel}>
                    <div className={styles.listHeader}>
                        <h2 style={{ background: "transparent" }} className={styles.sectionTitle}>
                            Users
                        </h2>
                        <div className={styles.pill}>
                            <User size={14} />
                            {filteredProfiles.length}
                        </div>
                    </div>

                    {isLoading && profiles.length === 0 ? (
                        <div className={styles.loading}>
                            <Loader2 className={styles.spinner} size={22} />
                            Loading users…
                        </div>
                    ) : (   
                        <div className={styles.userList}>
                            {filteredProfiles.map((p) => {
                                const online = withinMinutes(p.last_seen_at, 10);
                                const active30 = withinDays(p.last_seen_at, 30);

                                return (
                                    <button
                                        key={p.id}
                                        className={`${styles.userRow} ${selected?.id === p.id ? styles.activeRow : ""}`}
                                        onClick={() => {
                                            setSelected(p);
                                            loadEnrollmentsForUser(p.id)
                                        }}
                                    >
                                        <div className={styles.userMain}>
                                            <div className={styles.userEmail}>{p.email || "—"}</div>
                                            <div className={styles.userSub}>
                                                <span className={styles.muted}>Name:</span>{" "}
                                                <span>{p.full_name || "—"}</span>
                                                <span className={styles.dot}>•</span>
                                                <span className={styles.muted}>ID:</span>{" "}
                                                <span className={styles.mono}>{shortId(p.id)}</span>
                                                <span className={styles.dot}>•</span>
                                                <span className={styles.muted}>Last seen:</span>{" "}
                                                {p.last_seen_at ? fmtDate(p.last_seen_at) : "—"}
                                            </div>
                                        </div>

                                        <div className={styles.badges}>
                                            {online && <span className={styles.badgeGood}>Online</span>}
                                            {!online && active30 && <span className={styles.badge}>Active</span>}
                                            {!p.last_seen_at && <span className={styles.badgeWarn}>New</span>}
                                            {p.role === "admin" && <span className={styles.badgeAdmin}>Admin</span>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right: details */}
                <div className={styles.detailPanel}>
                    <div className={styles.detailHeader}>
                        <h2 style={{ background: "transparent" }} className={styles.sectionTitle}>
                            Details
                        </h2>
                    </div>

                    {!selected ? (
                        <div className={styles.emptyState}>Select a user to view details.</div>
                    ) : (
                        <div className={styles.detailBody}>
                            <div className={styles.detailCard}>
                                <div className={styles.detailRow}>
                                    <div className={styles.detailLabel}>
                                        <Mail size={14} /> Email
                                    </div>
                                    <div className={styles.detailValue}>{selected.email || "—"}</div>
                                </div>

                                <div className={styles.detailRow}>
                                    <div className={styles.detailLabel}>
                                        <User size={14} /> Name
                                    </div>
                                    <div className={styles.detailValue}>{selected.full_name || "—"}</div>
                                </div>

                                <div className={styles.detailRow}>
                                    <div className={styles.detailLabel}>
                                        <Shield size={14} /> Role
                                    </div>
                                    <div className={styles.detailValue}>{selected.role}</div>
                                </div>

                                <div className={styles.detailRow}>
                                    <div className={styles.detailLabel}>
                                        <Calendar size={14} /> Created
                                    </div>
                                    <div className={styles.detailValue}>{fmtDate(selected.created_at)}</div>
                                </div>

                                <div className={styles.detailRow}>
                                    <div className={styles.detailLabel}>
                                        <Clock size={14} /> Last seen
                                    </div>
                                    <div className={styles.detailValue}>{fmtDate(selected.last_seen_at)}</div>
                                </div>

                                <div className={styles.detailRow}>
                                    <div className={styles.detailLabel}>
                                        <User size={14} /> User ID
                                    </div>
                                    <div className={styles.detailValue}>
                                        <span className={styles.mono}>{selected.id}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
            <div className={styles.fullWidthPanel}>
                <div className={styles.enrollHeader}>
                    <h2 style={{ background: "transparent" }} className={styles.sectionTitle}>
                        Program Enrollments
                    </h2>

                    {selected ? (
                        <div className={styles.enrollSub}>
                            Showing enrollments for <span className={styles.mono}>{shortId(selected.id)}</span>
                        </div>
                    ) : (
                        <div className={styles.enrollSub}>Select a user to view enrollments</div>
                    )}
                </div>

                {!selected ? (
                    <div className={styles.emptyState}>No user selected.</div>
                ) : enrollmentsLoading ? (
                    <div className={styles.loading}>
                        <Loader2 className={styles.spinner} size={22} />
                        Loading enrollments…
                    </div>
                ) : enrollmentsError ? (
                    <div className={styles.errorBox}>⚠ {enrollmentsError}</div>
                ) : enrollments.length === 0 ? (
                    <div className={styles.emptyState}>No enrollments found for this user.</div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Program</th>
                                    <th>Status</th>
                                    <th>Progress</th>
                                    <th>Enrolled</th>
                                    <th>Completed</th>
                                    <th>Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map((e) => {
                                    const title = e.programs?.title ?? e.program_id;
                                    const progress = Number(e.progress_percentage ?? 0);
                                    return (
                                        <tr key={e.id}>
                                            <td className={styles.programCell}>
                                                <div className={styles.programTitle}>{title}</div>
                                                <div className={styles.mutedSmall}>{e.program_id}</div>
                                            </td>

                                            <td>
                                                {e.is_active ? (
                                                    <span className={styles.badgeGood}>Active</span>
                                                ) : (
                                                    <span className={styles.badge}>Inactive</span>
                                                )}
                                            </td>

                                            <td>
                                                <div className={styles.progressRow}>
                                                    <div className={styles.progressBar}>
                                                        <div
                                                            className={styles.progressFill}
                                                            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                                                        />
                                                    </div>
                                                    <div className={styles.progressText}>{progress.toFixed(0)}%</div>
                                                </div>
                                            </td>

                                            <td>{fmtDate(e.enrollment_date)}</td>
                                            <td>{fmtDate(e.completion_date)}</td>

                                            <td>
                                                <div className={styles.paymentStack}>
                                                    <span className={styles.badge}>{e.payment_status ?? "—"}</span>
                                                    {e.cost != null && <span className={styles.mutedSmall}>${Number(e.cost).toFixed(2)}</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
