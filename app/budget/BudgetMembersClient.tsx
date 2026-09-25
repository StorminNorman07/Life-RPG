"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createClient,
} from "@/utils/supabase/client";


import { useAppDialog } from "@/components/ui/AppDialogProvider";

type BudgetItem = {
  id:
    string;

  owner_id:
    string;

  name:
    string;

  role:
    "owner" | "editor" | "viewer";
};


type BudgetAccount = {
  id:
    string;

  name:
    string;

  account_type:
    string;

  balance:
    number;
};


type BudgetMember = {
  user_id:
    string;

  username:
    string;

  display_name:
    string;

  role:
    "owner" | "editor" | "viewer";

  joined_at:
    string;
};


type FriendSummary = {
  id:
    string;

  username:
    string;

  display_name:
    string;
};


type PendingInvite = {
  invite_id:
    string;

  invitee_id:
    string;

  invitee_username:
    string;

  invitee_display_name:
    string;

  role:
    "editor" | "viewer";

  created_at:
    string;
};


type AccountPermission =
  | "none"
  | "view"
  | "edit";


export default function BudgetMembersClient({
  budgetId,
  currentUserId,
}: {
  budgetId:
    string;

  currentUserId:
    string;
}) {
  const { confirm } = useAppDialog();
  const [
    budget,
    setBudget
  ] =
    useState<
      BudgetItem | null
    >(
      null
    );

  const [
    accounts,
    setAccounts
  ] =
    useState<
      BudgetAccount[]
    >([]);

  const [
    members,
    setMembers
  ] =
    useState<
      BudgetMember[]
    >([]);

  const [
    friends,
    setFriends
  ] =
    useState<
      FriendSummary[]
    >([]);

  const [
    pendingInvites,
    setPendingInvites
  ] =
    useState<
      PendingInvite[]
    >([]);

  const [
    selectedMemberId,
    setSelectedMemberId
  ] =
    useState("");

  const [
    selectedRole,
    setSelectedRole
  ] =
    useState<
      "editor" | "viewer"
    >(
      "viewer"
    );

  const [
    permissions,
    setPermissions
  ] =
    useState<
      Record<
        string,
        AccountPermission
      >
    >({});

  const [
    inviteFriendId,
    setInviteFriendId
  ] =
    useState("");

  const [
    inviteRole,
    setInviteRole
  ] =
    useState<
      "editor" | "viewer"
    >(
      "viewer"
    );

  const [
    loading,
    setLoading
  ] =
    useState(
      true
    );

  const [
    saving,
    setSaving
  ] =
    useState(
      false
    );

  const [
    notice,
    setNotice
  ] =
    useState<{
      type:
        "success" | "error";

      text:
        string;
    } | null>(
      null
    );


  const isOwner =
    budget?.owner_id ===
    currentUserId;


  function showNotice(
    type:
      "success" | "error",

    text:
      string
  ) {
    setNotice({
      type,
      text,
    });

    window.setTimeout(
      () =>
        setNotice(
          null
        ),
      3500
    );
  }


  const loadPage =
    useCallback(
      async () => {
        const supabase =
          createClient();

        const [
          budgetsResponse,
          accountsResponse,
          membersResponse,
          friendsResponse,
          invitesResponse,
        ] =
          await Promise.all([
            supabase.rpc(
              "get_my_budgets"
            ),

            supabase
              .from(
                "budget_accounts"
              )
              .select(
                "id, name, account_type, balance"
              )
              .eq(
                "budget_id",
                budgetId
              )
              .order(
                "created_at"
              ),

            supabase.rpc(
              "get_budget_members",
              {
                target_budget_id:
                  budgetId,
              }
            ),

            supabase.rpc(
              "get_friend_summaries"
            ),

            supabase.rpc(
              "get_budget_pending_invites",
              {
                target_budget_id:
                  budgetId,
              }
            ),
          ]);

        const error =
          budgetsResponse.error ??
          accountsResponse.error ??
          membersResponse.error ??
          friendsResponse.error ??
          invitesResponse.error;

        if (
          error
        ) {
          showNotice(
            "error",
            error.message
          );

          setLoading(
            false
          );

          return;
        }

        const budgetRows =
          (
            budgetsResponse.data ??
            []
          ) as
            BudgetItem[];

        setBudget(
          budgetRows.find(
            (
              item
            ) =>
              item.id ===
              budgetId
          ) ??
          null
        );

        setAccounts(
          (
            accountsResponse.data ??
            []
          ) as
            BudgetAccount[]
        );

        setMembers(
          (
            membersResponse.data ??
            []
          ) as
            BudgetMember[]
        );

        setFriends(
          (
            friendsResponse.data ??
            []
          ) as
            FriendSummary[]
        );

        setPendingInvites(
          (
            invitesResponse.data ??
            []
          ) as
            PendingInvite[]
        );

        setLoading(
          false
        );
      },
      [
        budgetId,
      ]
    );


  useEffect(() => {
    void loadPage();
  }, [
    loadPage,
  ]);


  const selectedMember =
    members.find(
      (
        member
      ) =>
        member.user_id ===
        selectedMemberId
    ) ??
    null;


  const availableFriends =
    useMemo(
      () => {
        const memberIds =
          new Set(
            members.map(
              (
                member
              ) =>
                member.user_id
            )
          );

        const invitedIds =
          new Set(
            pendingInvites.map(
              (
                invite
              ) =>
                invite.invitee_id
            )
          );

        return friends.filter(
          (
            friend
          ) =>
            !memberIds.has(
              friend.id
            ) &&
            !invitedIds.has(
              friend.id
            )
        );
      },
      [
        friends,
        members,
        pendingInvites,
      ]
    );


  async function selectMember(
    member:
      BudgetMember
  ) {
    setSelectedMemberId(
      member.user_id
    );

    setSelectedRole(
      member.role ===
        "owner"
        ? "viewer"
        : member.role
    );

    if (
      member.role ===
      "owner"
    ) {
      setPermissions(
        Object.fromEntries(
          accounts.map(
            (
              account
            ) => [
              account.id,
              "edit",
            ]
          )
        )
      );

      return;
    }

    const supabase =
      createClient();

    const {
      data,
      error,
    } =
      await supabase.rpc(
        "get_budget_member_permissions",
        {
          target_budget_id:
            budgetId,

          target_user_id:
            member.user_id,
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );

      return;
    }

    const rows =
      (
        data ??
        []
      ) as
        {
          account_id:
            string;

          permission:
            "view" | "edit";
        }[];

    setPermissions(
      Object.fromEntries(
        accounts.map(
          (
            account
          ) => [
            account.id,
            rows.find(
              (
                row
              ) =>
                row.account_id ===
                account.id
            )?.permission ??
              "none",
          ]
        )
      )
    );
  }


  function setPermission(
    accountId:
      string,

    permission:
      AccountPermission
  ) {
    setPermissions(
      (
        current
      ) => ({
        ...current,

        [accountId]:
          selectedRole ===
            "viewer" &&
          permission ===
            "edit"
            ? "view"
            : permission,
      })
    );
  }


  function changeRole(
    role:
      "editor" | "viewer"
  ) {
    setSelectedRole(
      role
    );

    if (
      role ===
      "viewer"
    ) {
      setPermissions(
        (
          current
        ) =>
          Object.fromEntries(
            Object.entries(
              current
            ).map(
              (
                [
                  accountId,
                  permission,
                ]
              ) => [
                accountId,
                permission ===
                  "edit"
                  ? "view"
                  : permission,
              ]
            )
          )
      );
    }
  }


  async function saveMemberAccess() {
    if (
      !selectedMember ||
      selectedMember.role ===
        "owner"
    ) {
      return;
    }

    setSaving(
      true
    );

    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.rpc(
        "update_budget_member_access",
        {
          target_budget_id:
            budgetId,

          target_user_id:
            selectedMember.user_id,

          target_role:
            selectedRole,

          target_account_ids:
            accounts.map(
              (
                account
              ) =>
                account.id
            ),

          target_permissions:
            accounts.map(
              (
                account
              ) =>
                permissions[
                  account.id
                ] ??
                "none"
            ),
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );
    } else {
      showNotice(
        "success",
        "Member access updated."
      );

      await loadPage();
    }

    setSaving(
      false
    );
  }


  async function sendInvite() {
    if (
      !inviteFriendId
    ) {
      return;
    }

    setSaving(
      true
    );

    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.rpc(
        "invite_friend_to_budget",
        {
          target_budget_id:
            budgetId,

          target_friend_id:
            inviteFriendId,

          target_role:
            inviteRole,
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );
    } else {
      setInviteFriendId(
        ""
      );

      showNotice(
        "success",
        "Budget invitation sent."
      );

      await loadPage();
    }

    setSaving(
      false
    );
  }


  async function cancelInvite(
    inviteId:
      string
  ) {
    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.rpc(
        "cancel_budget_invite",
        {
          target_invite_id:
            inviteId,
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );
    } else {
      showNotice(
        "success",
        "Invitation cancelled."
      );

      await loadPage();
    }
  }


  async function removeMember(
    member:
      BudgetMember
  ) {
    const confirmed =
      await confirm({
        title: `Remove ${member.display_name}?`,
        description:
          "They will lose access to this budget and its permitted accounts.",
        confirmLabel: "Remove member",
        tone: "danger",
      });

    if (!confirmed) {
      return;
    }

    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.rpc(
        "remove_budget_member",
        {
          target_budget_id:
            budgetId,

          target_user_id:
            member.user_id,
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );
    } else {
      setSelectedMemberId(
        ""
      );

      showNotice(
        "success",
        "Member removed."
      );

      await loadPage();
    }
  }


  if (
    loading
  ) {
    return (
      <main
        className="
          min-h-screen
          bg-black
          p-8
          text-white
        "
      >
        Loading members…
      </main>
    );
  }


  if (
    !budget
  ) {
    return (
      <main
        className="
          min-h-screen
          bg-black
          p-8
          text-white
        "
      >
        Budget not found.
      </main>
    );
  }


  return (
    <main
      className="
        min-h-screen
        bg-black
        px-5
        pb-20
        text-white

        md:px-8
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
        "
      >
        <header
          className="
            flex
            flex-wrap
            items-start
            justify-between
            gap-4
          "
        >
          <div>
            <Link
              href="/budget"
              className="
                text-sm
                font-bold
                text-zinc-500
                hover:text-white
              "
            >
              ← Back to Budget
            </Link>

            <p
              className="
                mt-6
                text-xs
                font-black
                uppercase
                tracking-[0.2em]
                text-zinc-500
              "
            >
              {budget.name}
            </p>

            <h1
              className="
                mt-2
                text-4xl
                font-black
              "
            >
              Members & Permissions
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-zinc-400
              "
            >
              Control exactly which accounts each person can see or edit.
            </p>
          </div>
        </header>


        {!isOwner && (
          <div
            className="
              mt-8
              rounded-2xl
              border
              border-amber-500/20
              bg-amber-950/10
              p-5
              text-amber-100
            "
          >
            Only the budget owner can change member permissions.
          </div>
        )}


        {isOwner && (
          <section
            className="
              mt-8
              rounded-2xl
              border
              border-white/10
              bg-zinc-950
              p-6
            "
          >
            <h2
              className="
                text-2xl
                font-black
              "
            >
              Invite a Friend
            </h2>

            <div
              className="
                mt-5
                grid
                gap-3

                md:grid-cols-[1fr_220px_auto]
              "
            >
              <select
                value={
                  inviteFriendId
                }
                onChange={(
                  event
                ) =>
                  setInviteFriendId(
                    event.target.value
                  )
                }
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-black
                  px-4
                  py-3
                "
              >
                <option
                  value=""
                >
                  Select a friend
                </option>

                {availableFriends.map(
                  (
                    friend
                  ) => (
                    <option
                      key={
                        friend.id
                      }
                      value={
                        friend.id
                      }
                    >
                      {friend.display_name} (@{friend.username})
                    </option>
                  )
                )}
              </select>

              <select
                value={
                  inviteRole
                }
                onChange={(
                  event
                ) =>
                  setInviteRole(
                    event.target.value as
                      "editor" | "viewer"
                  )
                }
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-black
                  px-4
                  py-3
                "
              >
                <option
                  value="viewer"
                >
                  Viewer
                </option>

                <option
                  value="editor"
                >
                  Editor
                </option>
              </select>

              <button
                type="button"
                disabled={
                  saving ||
                  !inviteFriendId
                }
                onClick={() =>
                  void sendInvite()
                }
                className="
                  rounded-xl
                  bg-white
                  px-5
                  py-3
                  font-black
                  text-black

                  disabled:opacity-40
                "
              >
                Send Invite
              </button>
            </div>

            <p
              className="
                mt-3
                text-sm
                text-zinc-500
              "
            >
              New members begin with no account access. Assign access after they accept.
            </p>
          </section>
        )}


        {isOwner &&
          pendingInvites.length >
            0 && (
          <section
            className="
              mt-8
            "
          >
            <h2
              className="
                text-2xl
                font-black
              "
            >
              Pending Invitations
            </h2>

            <div
              className="
                mt-4
                grid
                gap-3
              "
            >
              {pendingInvites.map(
                (
                  invite
                ) => (
                  <article
                    key={
                      invite.invite_id
                    }
                    className="
                      flex
                      flex-wrap
                      items-center
                      justify-between
                      gap-4
                      rounded-2xl
                      border
                      border-white/10
                      bg-zinc-950
                      p-5
                    "
                  >
                    <div>
                      <h3
                        className="
                          font-black
                        "
                      >
                        {invite.invitee_display_name}
                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-zinc-500
                        "
                      >
                        @{invite.invitee_username} · {invite.role}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void cancelInvite(
                          invite.invite_id
                        )
                      }
                      className="
                        rounded-xl
                        border
                        border-red-500/20
                        px-4
                        py-2
                        font-bold
                        text-red-300
                      "
                    >
                      Cancel Invite
                    </button>
                  </article>
                )
              )}
            </div>
          </section>
        )}


        <section
          className="
            mt-8
            grid
            gap-5

            lg:grid-cols-[320px_minmax(0,1fr)]
          "
        >
          <aside
            className="
              rounded-2xl
              border
              border-white/10
              bg-zinc-950
              p-4
            "
          >
            <h2
              className="
                px-2
                text-sm
                font-black
                uppercase
                tracking-[0.15em]
                text-zinc-500
              "
            >
              Current Members
            </h2>

            <div
              className="
                mt-3
                space-y-2
              "
            >
              {members.map(
                (
                  member
                ) => (
                  <button
                    key={
                      member.user_id
                    }
                    type="button"
                    onClick={() =>
                      void selectMember(
                        member
                      )
                    }
                    className={`
                      w-full
                      rounded-xl
                      border
                      p-3
                      text-left
                      transition

                      ${
                        selectedMemberId ===
                        member.user_id
                          ? "border-white/30 bg-white/[0.08]"
                          : "border-transparent hover:bg-white/[0.04]"
                      }
                    `}
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >
                      <div
                        className="
                          min-w-0
                        "
                      >
                        <p
                          className="
                            truncate
                            font-black
                          "
                        >
                          {member.display_name}
                        </p>

                        <p
                          className="
                            mt-1
                            truncate
                            text-xs
                            text-zinc-500
                          "
                        >
                          @{member.username}
                        </p>
                      </div>

                      <span
                        className="
                          rounded-full
                          border
                          border-white/10
                          px-2
                          py-1
                          text-xs
                          capitalize
                          text-zinc-400
                        "
                      >
                        {member.role}
                      </span>
                    </div>
                  </button>
                )
              )}
            </div>
          </aside>


          <section
            className="
              rounded-2xl
              border
              border-white/10
              bg-zinc-950
              p-6
            "
          >
            {!selectedMember ? (
              <div
                className="
                  flex
                  min-h-80
                  items-center
                  justify-center
                  text-center
                  text-zinc-500
                "
              >
                Select a member to review their access.
              </div>
            ) : selectedMember.role ===
              "owner" ? (
              <div>
                <h2
                  className="
                    text-2xl
                    font-black
                  "
                >
                  {selectedMember.display_name}
                </h2>

                <p
                  className="
                    mt-2
                    text-zinc-400
                  "
                >
                  The budget owner has full access to every account and cannot be restricted.
                </p>

                <div
                  className="
                    mt-6
                    grid
                    gap-3

                    sm:grid-cols-2
                  "
                >
                  {accounts.map(
                    (
                      account
                    ) => (
                      <div
                        key={
                          account.id
                        }
                        className="
                          rounded-xl
                          border
                          border-green-500/20
                          bg-green-950/10
                          p-4
                        "
                      >
                        <p
                          className="
                            font-black
                          "
                        >
                          {account.name}
                        </p>

                        <p
                          className="
                            mt-1
                            text-sm
                            text-green-300
                          "
                        >
                          Full access
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div
                  className="
                    flex
                    flex-wrap
                    items-start
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <h2
                      className="
                        text-2xl
                        font-black
                      "
                    >
                      {selectedMember.display_name}
                    </h2>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-zinc-500
                      "
                    >
                      @{selectedMember.username}
                    </p>
                  </div>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() =>
                        void removeMember(
                          selectedMember
                        )
                      }
                      className="
                        rounded-xl
                        border
                        border-red-500/20
                        px-4
                        py-2
                        font-bold
                        text-red-300
                      "
                    >
                      Remove Member
                    </button>
                  )}
                </div>


                <div
                  className="
                    mt-6
                  "
                >
                  <p
                    className="
                      text-sm
                      font-black
                    "
                  >
                    Budget role
                  </p>

                  <div
                    className="
                      mt-2
                      grid
                      grid-cols-2
                      rounded-xl
                      border
                      border-white/10
                      bg-black
                      p-1
                    "
                  >
                    {(
                      [
                        "viewer",
                        "editor",
                      ] as const
                    ).map(
                      (
                        role
                      ) => (
                        <button
                          key={
                            role
                          }
                          type="button"
                          disabled={
                            !isOwner
                          }
                          onClick={() =>
                            changeRole(
                              role
                            )
                          }
                          className={`
                            rounded-lg
                            px-4
                            py-3
                            font-bold
                            capitalize

                            ${
                              selectedRole ===
                              role
                                ? "bg-white text-black"
                                : "text-zinc-500"
                            }
                          `}
                        >
                          {role}
                        </button>
                      )
                    )}
                  </div>
                </div>


                <div
                  className="
                    mt-8
                  "
                >
                  <div
                    className="
                      flex
                      items-end
                      justify-between
                      gap-4
                    "
                  >
                    <div>
                      <h3
                        className="
                          text-xl
                          font-black
                        "
                      >
                        Account access
                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-zinc-500
                        "
                      >
                        No access hides balances, history, reports, and transaction details.
                      </p>
                    </div>
                  </div>


                  <div
                    className="
                      mt-4
                      space-y-3
                    "
                  >
                    {accounts.map(
                      (
                        account
                      ) => {
                        const permission =
                          permissions[
                            account.id
                          ] ??
                          "none";

                        const options:
                          AccountPermission[] =
                          selectedRole ===
                            "editor"
                            ? [
                                "none",
                                "view",
                                "edit",
                              ]
                            : [
                                "none",
                                "view",
                              ];

                        return (
                          <article
                            key={
                              account.id
                            }
                            className="
                              rounded-2xl
                              border
                              border-white/10
                              bg-black/30
                              p-4
                            "
                          >
                            <div
                              className="
                                flex
                                flex-wrap
                                items-center
                                justify-between
                                gap-4
                              "
                            >
                              <div>
                                <p
                                  className="
                                    font-black
                                  "
                                >
                                  {account.name}
                                </p>

                                <p
                                  className="
                                    mt-1
                                    text-xs
                                    capitalize
                                    text-zinc-500
                                  "
                                >
                                  {account.account_type}
                                </p>
                              </div>

                              <div
                                className={`
                                  grid
                                  rounded-xl
                                  border
                                  border-white/10
                                  bg-zinc-950
                                  p-1

                                  ${
                                    options.length ===
                                    3
                                      ? "grid-cols-3"
                                      : "grid-cols-2"
                                  }
                                `}
                              >
                                {options.map(
                                  (
                                    option
                                  ) => (
                                    <button
                                      key={
                                        option
                                      }
                                      type="button"
                                      disabled={
                                        !isOwner
                                      }
                                      onClick={() =>
                                        setPermission(
                                          account.id,
                                          option
                                        )
                                      }
                                      className={`
                                        rounded-lg
                                        px-3
                                        py-2
                                        text-sm
                                        font-bold
                                        capitalize

                                        ${
                                          permission ===
                                          option
                                            ? "bg-white text-black"
                                            : "text-zinc-500"
                                        }
                                      `}
                                    >
                                      {option ===
                                        "none"
                                        ? "No access"
                                        : option}
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      }
                    )}
                  </div>
                </div>


                {isOwner && (
                  <button
                    type="button"
                    disabled={
                      saving
                    }
                    onClick={() =>
                      void saveMemberAccess()
                    }
                    className="
                      mt-6
                      w-full
                      rounded-xl
                      bg-white
                      px-5
                      py-3
                      font-black
                      text-black

                      disabled:opacity-40
                    "
                  >
                    Save Permissions
                  </button>
                )}
              </div>
            )}
          </section>
        </section>
      </div>


      {notice && (
        <div
          className={`
            fixed
            bottom-5
            right-5
            z-[600]
            max-w-sm
            rounded-2xl
            border
            px-4
            py-3
            text-sm
            font-bold
            shadow-2xl

            ${
              notice.type ===
                "error"
                ? "border-red-500/25 bg-red-950/90 text-red-100"
                : "border-green-500/25 bg-green-950/90 text-green-100"
            }
          `}
        >
          {notice.text}
        </div>
      )}
    </main>
  );
}
