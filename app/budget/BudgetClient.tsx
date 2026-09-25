"use client";

// Budget correction build: transaction undo + safe empty-account deletion.

import Link from "next/link";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createClient,
} from "@/utils/supabase/client";


import { useAppDialog } from "@/components/ui/AppDialogProvider";

type BudgetTab =
  | "overview"
  | "history"
  | "reports";


type PaycheckMode =
  | "default"
  | "custom_percentage"
  | "custom_amount";


type BudgetRole =
  | "owner"
  | "editor"
  | "viewer";


type BudgetItem = {
  id:
    string;

  owner_id:
    string;

  name:
    string;

  description:
    string;

  currency:
    string;

  paycheck_mode:
    PaycheckMode;

  is_personal:
    boolean;

  role:
    BudgetRole;

  created_at:
    string;
};


type BudgetAccount = {
  id:
    string;

  budget_id:
    string;

  name:
    string;

  account_type:
    string;

  balance:
    number;

  default_allocation_percent:
    number;

  access_level:
    "view" | "edit";
};


type BudgetTransaction = {
  id:
    string;

  budget_id:
    string;

  created_by:
    string;

  transaction_type:
    "paycheck" | "income" | "expense" | "transfer";

  amount:
    number;

  description:
    string;

  category:
    string;

  transaction_date:
    string;

  source_account_id:
    string | null;

  destination_account_id:
    string | null;

  created_at:
    string;
};


type BudgetAllocation = {
  transaction_id:
    string;

  account_id:
    string;

  amount:
    number;

  allocation_percent:
    number | null;
};


type BudgetInvite = {
  invite_id:
    string;

  budget_id:
    string;

  budget_name:
    string;

  inviter_id:
    string;

  inviter_username:
    string;

  inviter_display_name:
    string;

  role:
    "editor" | "viewer";

  created_at:
    string;
};


type ModalName =
  | "paycheck"
  | "income"
  | "expense"
  | "transfer"
  | "account"
  | "editAccount"
  | "budget"
  | "settings"
  | null;


const categories = [
  "Food",
  "Gas",
  "Housing",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Health",
  "Education",
  "Bills",
  "Giving",
  "Travel",
  "Investment",
  "Other",
];


function money(
  amount:
    number
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style:
        "currency",

      currency:
        "USD",
    }
  ).format(
    amount
  );
}


function today() {
  return new Date()
    .toISOString()
    .slice(
      0,
      10
    );
}


function monthKey(
  date:
    string
) {
  return date.slice(
    0,
    7
  );
}


function monthLabel(
  value:
    string
) {
  const [
    year,
    month,
  ] =
    value
      .split("-")
      .map(Number);

  return new Date(
    year,
    month -
      1,
    1
  ).toLocaleDateString(
    undefined,
    {
      month:
        "long",

      year:
        "numeric",
    }
  );
}


export default function BudgetClient() {
  const { confirm } = useAppDialog();
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const requestedBudgetId =
    searchParams.get(
      "budget"
    ) ??
    "";

  const [
    budgets,
    setBudgets
  ] =
    useState<
      BudgetItem[]
    >([]);

  const [
    activeBudgetId,
    setActiveBudgetId
  ] =
    useState("");

  const [
    accounts,
    setAccounts
  ] =
    useState<
      BudgetAccount[]
    >([]);

  const [
    transactions,
    setTransactions
  ] =
    useState<
      BudgetTransaction[]
    >([]);

  const [
    allocations,
    setAllocations
  ] =
    useState<
      BudgetAllocation[]
    >([]);

  const [
    invites,
    setInvites
  ] =
    useState<
      BudgetInvite[]
    >([]);

  const [
    activeTab,
    setActiveTab
  ] =
    useState<
      BudgetTab
    >(
      "overview"
    );

  const [
    modal,
    setModal
  ] =
    useState<
      ModalName
    >(
      null
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
    undoingTransactionId,
    setUndoingTransactionId
  ] =
    useState("");

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

  const [
    selectedMonth,
    setSelectedMonth
  ] =
    useState(
      monthKey(
        today()
      )
    );

  const [
    amount,
    setAmount
  ] =
    useState("");

  const [
    description,
    setDescription
  ] =
    useState("");

  const [
    transactionDate,
    setTransactionDate
  ] =
    useState(
      today()
    );

  const [
    category,
    setCategory
  ] =
    useState(
      "Other"
    );

  const [
    sourceAccountId,
    setSourceAccountId
  ] =
    useState("");

  const [
    destinationAccountId,
    setDestinationAccountId
  ] =
    useState("");

  const [
    paycheckMode,
    setPaycheckMode
  ] =
    useState<
      PaycheckMode
    >(
      "default"
    );

  const [
    paycheckValues,
    setPaycheckValues
  ] =
    useState<
      Record<
        string,
        string
      >
    >({});

  const [
    newBudgetName,
    setNewBudgetName
  ] =
    useState("");

  const [
    newBudgetDescription,
    setNewBudgetDescription
  ] =
    useState("");

  const [
    newAccountName,
    setNewAccountName
  ] =
    useState("");

  const [
    newAccountType,
    setNewAccountType
  ] =
    useState(
      "spending"
    );

  const [
    editingAccountId,
    setEditingAccountId
  ] =
    useState("");

  const [
    editingAccountName,
    setEditingAccountName
  ] =
    useState("");

  const [
    editingAccountType,
    setEditingAccountType
  ] =
    useState(
      "spending"
    );

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
      "editor"
    );


  const activeBudget =
    budgets.find(
      (
        budget
      ) =>
        budget.id ===
        activeBudgetId
    ) ??
    null;

  const editableAccounts =
    accounts.filter(
      (
        account
      ) =>
        account.access_level ===
        "edit"
    );

  const canEdit =
    editableAccounts.length >
    0;

  const isOwner =
    activeBudget?.role ===
    "owner";


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


  const loadShell =
    useCallback(
      async () => {
        const supabase =
          createClient();

        const {
          error:
            personalBudgetError,
        } =
          await supabase.rpc(
            "ensure_personal_budget"
          );

        if (
          personalBudgetError
        ) {
          showNotice(
            "error",
            personalBudgetError.message
          );

          setLoading(
            false
          );

          return;
        }

        const [
          budgetsResponse,
          invitesResponse,
        ] =
          await Promise.all([
            supabase.rpc(
              "get_my_budgets"
            ),

            supabase.rpc(
              "get_budget_invites"
            ),
          ]);

        const error =
          budgetsResponse.error ??
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

        const nextBudgets =
          (
            budgetsResponse.data ??
            []
          ) as
            BudgetItem[];

        setBudgets(
          nextBudgets
        );

        setInvites(
          (
            invitesResponse.data ??
            []
          ) as
            BudgetInvite[]
        );

        const requestedBudget =
          nextBudgets.find(
            (
              budget
            ) =>
              budget.id ===
              requestedBudgetId
          );

        const currentBudget =
          nextBudgets.find(
            (
              budget
            ) =>
              budget.id ===
              activeBudgetId
          );

        const personalBudget =
          nextBudgets.find(
            (
              budget
            ) =>
              budget.is_personal &&
              budget.owner_id
          );

        const nextActiveBudgetId =
          requestedBudget?.id ??
          currentBudget?.id ??
          personalBudget?.id ??
          nextBudgets[0]?.id ??
          "";

        setActiveBudgetId(
          nextActiveBudgetId
        );

        if (
          nextActiveBudgetId &&
          requestedBudgetId !==
            nextActiveBudgetId
        ) {
          router.replace(
            `/budget?budget=${nextActiveBudgetId}`,
            {
              scroll:
                false,
            }
          );
        }

        setLoading(
          false
        );
      },
      [
        activeBudgetId,
        requestedBudgetId,
        router,
      ]
    );

  const loadBudgetData =
    useCallback(
      async () => {
        if (
          !activeBudgetId
        ) {
          setAccounts(
            []
          );

          setTransactions(
            []
          );

          setAllocations(
            []
          );

          return;
        }

        const supabase =
          createClient();

        const [
          accountsResponse,
          transactionsResponse,
        ] =
          await Promise.all([
            supabase.rpc(
              "get_visible_budget_accounts",
              {
                target_budget_id:
                  activeBudgetId,
              }
            ),

            supabase.rpc(
              "get_visible_budget_transactions",
              {
                target_budget_id:
                  activeBudgetId,
              }
            ),
          ]);

        const error =
          accountsResponse.error ??
          transactionsResponse.error;

        if (
          error
        ) {
          showNotice(
            "error",
            error.message
          );

          return;
        }

        const nextTransactions =
          (
            transactionsResponse.data ??
            []
          ) as
            BudgetTransaction[];

        setAccounts(
          (
            accountsResponse.data ??
            []
          ) as
            BudgetAccount[]
        );

        setTransactions(
          nextTransactions
        );

        const {
          data:
            allocationData,
          error:
            allocationError,
        } =
          await supabase.rpc(
            "get_visible_budget_allocations",
            {
              target_budget_id:
                activeBudgetId,
            }
          );

        if (
          allocationError
        ) {
          showNotice(
            "error",
            allocationError.message
          );

          return;
        }

        setAllocations(
          (
            allocationData ??
            []
          ) as
            BudgetAllocation[]
        );
      },
      [
        activeBudgetId,
      ]
    );


  useEffect(() => {
    void loadShell();
  }, [
    loadShell,
  ]);


  useEffect(() => {
    void loadBudgetData();
  }, [
    loadBudgetData,
  ]);


  const totalBalance =
    accounts.reduce(
      (
        total,
        account
      ) =>
        total +
        Number(
          account.balance
        ),
      0
    );

  const savingsBalance =
    accounts
      .filter(
        (
          account
        ) =>
          [
            "savings",
            "investment",
          ].includes(
            account.account_type
          )
      )
      .reduce(
        (
          total,
          account
        ) =>
          total +
          Number(
            account.balance
          ),
        0
      );

  const availableBalance =
    totalBalance -
    savingsBalance;


  const reportMonths =
    useMemo(
      () =>
        Array.from(
          new Set([
            monthKey(
              today()
            ),

            ...transactions.map(
              (
                transaction
              ) =>
                monthKey(
                  transaction.transaction_date
                )
            ),
          ])
        ).sort(
          (
            first,
            second
          ) =>
            second.localeCompare(
              first
            )
        ),
      [
        transactions,
      ]
    );

  const monthlyTransactions =
    transactions.filter(
      (
        transaction
      ) =>
        monthKey(
          transaction.transaction_date
        ) ===
        selectedMonth
    );

  const monthlyIncome =
    monthlyTransactions
      .filter(
        (
          transaction
        ) =>
          transaction.transaction_type ===
            "income" ||
          transaction.transaction_type ===
            "paycheck"
      )
      .reduce(
        (
          total,
          transaction
        ) =>
          total +
          Number(
            transaction.amount
          ),
        0
      );

  const monthlyExpenses =
    monthlyTransactions
      .filter(
        (
          transaction
        ) =>
          transaction.transaction_type ===
          "expense"
      )
      .reduce(
        (
          total,
          transaction
        ) =>
          total +
          Number(
            transaction.amount
          ),
        0
      );

  const monthlySaved =
    monthlyTransactions
      .filter(
        (
          transaction
        ) =>
          transaction.transaction_type ===
          "paycheck"
      )
      .reduce(
        (
          total,
          transaction
        ) => {
          const transactionAllocations =
            allocations.filter(
              (
                allocation
              ) =>
                allocation.transaction_id ===
                transaction.id
            );

          return total +
            transactionAllocations.reduce(
              (
                saved,
                allocation
              ) => {
                const account =
                  accounts.find(
                    (
                      item
                    ) =>
                      item.id ===
                      allocation.account_id
                  );

                return saved +
                  (
                    account &&
                    [
                      "savings",
                      "investment",
                    ].includes(
                      account.account_type
                    )
                      ? Number(
                          allocation.amount
                        )
                      : 0
                  );
              },
              0
            );
        },
        0
      );


  function resetTransactionForm() {
    setAmount(
      ""
    );

    setDescription(
      ""
    );

    setTransactionDate(
      today()
    );

    setCategory(
      "Other"
    );
  }


  function openPaycheck() {
    if (
      !activeBudget
    ) {
      return;
    }

    setPaycheckMode(
      activeBudget.paycheck_mode
    );

    setPaycheckValues(
      Object.fromEntries(
        editableAccounts.map(
          (
            account
          ) => [
            account.id,
            activeBudget.paycheck_mode ===
              "default"
              ? String(
                  account.default_allocation_percent
                )
              : "",
          ]
        )
      )
    );

    setDescription(
      "Paycheck"
    );

    setAmount(
      ""
    );

    setTransactionDate(
      today()
    );

    setModal(
      "paycheck"
    );
  }


  function selectBudget(
    budgetId:
      string
  ) {
    setActiveBudgetId(
      budgetId
    );

    setModal(
      null
    );

    router.replace(
      `/budget?budget=${budgetId}`,
      {
        scroll:
          false,
      }
    );
  }


  async function refreshAll() {
    await loadShell();

    await loadBudgetData();
  }


  async function deleteCurrentBudget() {
    if (
      !activeBudget ||
      !isOwner
    ) {
      return;
    }

    if (
      activeBudget.is_personal
    ) {
      showNotice(
        "error",
        "Your Personal Budget cannot be deleted."
      );

      return;
    }

    const confirmed =
      await confirm({
        title: `Delete "${activeBudget.name}"?`,
        description:
          "This permanently deletes its accounts, transactions, member access, invitations, and reports. This cannot be undone.",
        confirmLabel: "Delete budget",
        tone: "danger",
      });

    if (
      !confirmed
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
        "delete_budget",
        {
          target_budget_id:
            activeBudget.id,
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );

      setSaving(
        false
      );

      return;
    }

    setModal(
      null
    );

    setActiveBudgetId(
      ""
    );

    showNotice(
      "success",
      "Budget deleted."
    );

    await loadShell();

    setSaving(
      false
    );
  }


  async function createBudget() {
    if (
      !newBudgetName.trim()
    ) {
      return;
    }

    setSaving(
      true
    );

    const supabase =
      createClient();

    const {
      data,
      error,
    } =
      await supabase.rpc(
        "create_budget",
        {
          budget_name:
            newBudgetName,

          budget_description:
            newBudgetDescription,
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
      setNewBudgetName(
        ""
      );

      setNewBudgetDescription(
        ""
      );

      setModal(
        null
      );

      showNotice(
        "success",
        "Budget created."
      );

      await loadShell();

      if (
        data
      ) {
        selectBudget(
          data as
            string
        );
      }
    }

    setSaving(
      false
    );
  }


  async function createAccount() {
    if (
      !activeBudgetId ||
      !newAccountName.trim()
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
      await supabase
        .from(
          "budget_accounts"
        )
        .insert({
          budget_id:
            activeBudgetId,

          name:
            newAccountName.trim(),

          account_type:
            newAccountType,

          default_allocation_percent:
            0,
        });

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );
    } else {
      setNewAccountName(
        ""
      );

      setNewAccountType(
        "spending"
      );

      setModal(
        null
      );

      showNotice(
        "success",
        "Account created."
      );

      await loadBudgetData();
    }

    setSaving(
      false
    );
  }


  async function leaveCurrentBudget() {
    if (
      !activeBudget ||
      isOwner
    ) {
      return;
    }

    const confirmed =
      await confirm({
        title: `Leave "${activeBudget.name}"?`,
        description:
          "You will immediately lose access to this budget. The owner would need to invite you again if you want to return.",
        confirmLabel: "Leave budget",
        tone: "danger",
      });

    if (
      !confirmed
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
        "leave_budget",
        {
          target_budget_id:
            activeBudget.id,
        }
      );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );

      setSaving(
        false
      );

      return;
    }

    setModal(
      null
    );

    setActiveBudgetId(
      ""
    );

    router.replace(
      "/budget",
      {
        scroll:
          false,
      }
    );

    showNotice(
      "success",
      `You left ${activeBudget.name}.`
    );

    await loadShell();

    setSaving(
      false
    );
  }


  function openAccountEditor(
    account:
      BudgetAccount
  ) {
    if (
      !isOwner
    ) {
      return;
    }

    setEditingAccountId(
      account.id
    );

    setEditingAccountName(
      account.name
    );

    setEditingAccountType(
      account.account_type
    );

    setModal(
      "editAccount"
    );
  }


  async function saveAccountEdit() {
    const nextName =
      editingAccountName.trim();

    if (
      !isOwner ||
      !activeBudgetId ||
      !editingAccountId ||
      !nextName
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
      await supabase
        .from(
          "budget_accounts"
        )
        .update({
          name:
            nextName,

          account_type:
            editingAccountType,
        })
        .eq(
          "id",
          editingAccountId
        )
        .eq(
          "budget_id",
          activeBudgetId
        );

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );
    } else {
      setEditingAccountId(
        ""
      );

      setEditingAccountName(
        ""
      );

      setEditingAccountType(
        "spending"
      );

      setModal(
        null
      );

      showNotice(
        "success",
        "Account updated."
      );

      await loadBudgetData();
    }

    setSaving(
      false
    );
  }


  async function saveSettings() {
    if (
      !activeBudget ||
      !isOwner
    ) {
      return;
    }

    const defaultTotal =
      accounts.reduce(
        (
          total,
          account
        ) =>
          total +
          Number(
            account.default_allocation_percent
          ),
        0
      );

    if (
      activeBudget.paycheck_mode ===
        "default" &&
      Math.abs(
        defaultTotal -
          100
      ) >
        0.0001
    ) {
      showNotice(
        "error",
        "Default percentages must total 100%."
      );

      return;
    }

    setSaving(
      true
    );

    const supabase =
      createClient();

    const [
      budgetResponse,
      ...accountResponses
    ] =
      await Promise.all([
        supabase
          .from(
            "budgets"
          )
          .update({
            paycheck_mode:
              activeBudget.paycheck_mode,
          })
          .eq(
            "id",
            activeBudget.id
          ),

        ...accounts.map(
          (
            account
          ) =>
            supabase
              .from(
                "budget_accounts"
              )
              .update({
                default_allocation_percent:
                  account.default_allocation_percent,
              })
              .eq(
                "id",
                account.id
              )
        ),
      ]);

    const error =
      budgetResponse.error ??
      accountResponses.find(
        (
          response
        ) =>
          response.error
      )?.error;

    if (
      error
    ) {
      showNotice(
        "error",
        error.message
      );
    } else {
      setModal(
        null
      );

      showNotice(
        "success",
        "Budget settings saved."
      );

      await refreshAll();
    }

    setSaving(
      false
    );
  }


  async function addPaycheck() {
    if (
      !activeBudgetId
    ) {
      return;
    }

    const paycheckAmount =
      Number(
        amount
      );

    const values =
      editableAccounts.map(
        (
          account
        ) =>
          Number(
            paycheckValues[
              account.id
            ] ??
            0
          )
      );

    const total =
      values.reduce(
        (
          sum,
          value
        ) =>
          sum +
          value,
        0
      );

    if (
      !Number.isFinite(
        paycheckAmount
      ) ||
      paycheckAmount <=
        0
    ) {
      return;
    }

    if (
      paycheckMode ===
        "custom_amount"
        ? Math.abs(
            total -
              paycheckAmount
          ) >
          0.009
        : Math.abs(
            total -
              100
          ) >
          0.0001
    ) {
      showNotice(
        "error",
        paycheckMode ===
          "custom_amount"
          ? "Allocated amounts must equal the paycheck total."
          : "Percentages must total 100%."
      );

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
        "add_budget_paycheck",
        {
          target_budget_id:
            activeBudgetId,

          target_amount:
            paycheckAmount,

          target_description:
            description,

          target_date:
            transactionDate,

          target_mode:
            paycheckMode,

          target_account_ids:
            editableAccounts.map(
              (
                account
              ) =>
                account.id
            ),

          target_values:
            values,
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
      setModal(
        null
      );

      resetTransactionForm();

      showNotice(
        "success",
        "Paycheck added."
      );

      await loadBudgetData();
    }

    setSaving(
      false
    );
  }


  async function addIncome() {
    await runSimpleTransaction(
      "add_budget_income",
      {
        target_account_id:
          destinationAccountId,
      },
      "Income added."
    );
  }


  async function addExpense() {
    await runSimpleTransaction(
      "add_budget_expense",
      {
        target_account_id:
          sourceAccountId,
      },
      "Expense recorded."
    );
  }


  async function runSimpleTransaction(
    functionName:
      "add_budget_income" | "add_budget_expense",

    accountArgument:
      Record<
        string,
        string
      >,

    successMessage:
      string
  ) {
    if (
      !activeBudgetId
    ) {
      return;
    }

    const numericAmount =
      Number(
        amount
      );

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <=
        0
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
        functionName,
        {
          target_budget_id:
            activeBudgetId,

          target_amount:
            numericAmount,

          target_description:
            description,

          target_category:
            category,

          target_date:
            transactionDate,

          ...accountArgument,
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
      setModal(
        null
      );

      resetTransactionForm();

      showNotice(
        "success",
        successMessage
      );

      await loadBudgetData();
    }

    setSaving(
      false
    );
  }


  async function transferMoney() {
    if (
      !activeBudgetId
    ) {
      return;
    }

    const numericAmount =
      Number(
        amount
      );

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <=
        0
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
        "transfer_budget_money",
        {
          target_budget_id:
            activeBudgetId,

          target_from_account_id:
            sourceAccountId,

          target_to_account_id:
            destinationAccountId,

          target_amount:
            numericAmount,

          target_description:
            description,

          target_date:
            transactionDate,
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
      setModal(
        null
      );

      resetTransactionForm();

      showNotice(
        "success",
        "Money transferred."
      );

      await loadBudgetData();
    }

    setSaving(
      false
    );
  }




  async function respondToInvite(
    inviteId:
      string,

    accept:
      boolean
  ) {
    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.rpc(
        accept
          ? "accept_budget_invite"
          : "decline_budget_invite",
        {
          invite_id:
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
        accept
          ? "Budget invitation accepted."
          : "Budget invitation declined."
      );

      await loadShell();
    }
  }


  async function deleteAccount(
    account:
      BudgetAccount
  ) {
    if (
      Math.abs(
        Number(
          account.balance
        )
      ) >=
      0.005
    ) {
      showNotice(
        "error",
        "Move this account's balance before deleting it."
      );

      return;
    }

    const confirmed =
      await confirm({
        title: `Delete "${account.name}"?`,
        description:
          "This account will be permanently removed from the budget.",
        confirmLabel: "Delete account",
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
        "delete_empty_budget_account",
        {
          target_account_id:
            account.id,
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
        "Account deleted."
      );

      await loadBudgetData();
    }
  }


  async function undoTransaction(
    transaction:
      BudgetTransaction
  ) {
    if (
      !isOwner ||
      undoingTransactionId
    ) {
      return;
    }

    const confirmed =
      await confirm({
        title: `Undo this ${transaction.transaction_type}?`,
        description:
          "This reverses the balance change and permanently removes this entry from history.",
        confirmLabel: "Undo transaction",
        tone: "danger",
      });

    if (
      !confirmed
    ) {
      return;
    }

    setUndoingTransactionId(
      transaction.id
    );

    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase.rpc(
        "undo_budget_transaction",
        {
          target_transaction_id:
            transaction.id,
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
        "Transaction undone."
      );

      await loadBudgetData();
    }

    setUndoingTransactionId(
      ""
    );
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
        Loading budget…
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
            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.2em]
                text-zinc-500
              "
            >
              Finance
            </p>

            <h1
              className="
                mt-2
                text-4xl
                font-black
              "
            >
              💰 Budget
            </h1>

            <p
              className="
                mt-2
                text-zinc-400
              "
            >
              Give every dollar a job.
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            <button
              type="button"
              onClick={() =>
                setModal(
                  "budget"
                )
              }
              className="
                rounded-xl
                border
                border-white/10
                bg-zinc-950
                px-4
                py-2
                font-bold
              "
            >
              + New Budget
            </button>

            {activeBudgetId && (
              <Link
                href={`/budget/members?budget=${activeBudgetId}`}
                title={`Manage members for ${activeBudget?.name ?? "this budget"}`}
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-zinc-950
                  px-4
                  py-2
                  font-bold
                "
              >
                Members
              </Link>
            )}

            {isOwner && (
              <button
                type="button"
                onClick={() => {
                  if (
                    activeBudgetId
                  ) {
                    setModal(
                      "settings"
                    );
                  }
                }}
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-zinc-950
                  px-4
                  py-2
                  font-bold
                "
              >
                Settings
              </button>
            )}

            {activeBudget &&
              !isOwner && (
              <button
                type="button"
                disabled={
                  saving
                }
                onClick={() =>
                  void leaveCurrentBudget()
                }
                className="
                  rounded-xl
                  border
                  border-red-500/25
                  bg-red-950/20
                  px-4
                  py-2
                  font-bold
                  text-red-200

                  transition

                  hover:bg-red-950/40
                  disabled:opacity-40
                "
              >
                Leave Budget
              </button>
            )}
          </div>
        </header>


        {invites.length >
          0 && (
          <section
            className="
              mt-6
              rounded-2xl
              border
              border-amber-500/20
              bg-amber-950/10
              p-4
            "
          >
            <h2
              className="
                font-black
              "
            >
              Budget Invitations
            </h2>

            <div
              className="
                mt-3
                space-y-3
              "
            >
              {invites.map(
                (
                  invite
                ) => (
                  <div
                    key={
                      invite.invite_id
                    }
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-white/10
                      bg-black/30
                      p-3
                    "
                  >
                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <p
                        className="
                          font-black
                        "
                      >
                        {invite.budget_name}
                      </p>

                      <p
                        className="
                          text-sm
                          text-zinc-500
                        "
                      >
                        {invite.inviter_display_name} invited you as {invite.role}.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void respondToInvite(
                          invite.invite_id,
                          true
                        )
                      }
                      className="
                        rounded-lg
                        bg-white
                        px-3
                        py-2
                        text-sm
                        font-black
                        text-black
                      "
                    >
                      Accept
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void respondToInvite(
                          invite.invite_id,
                          false
                        )
                      }
                      className="
                        rounded-lg
                        border
                        border-white/10
                        px-3
                        py-2
                        text-sm
                        font-bold
                      "
                    >
                      Decline
                    </button>
                  </div>
                )
              )}
            </div>
          </section>
        )}


        <section
          className="
            mt-8
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
          "
        >
          <div>
            <label
              className="
                text-xs
                font-black
                uppercase
                tracking-[0.16em]
                text-zinc-500
              "
            >
              Active budget
            </label>

            <select
              value={
                activeBudgetId
              }
              onChange={(
                event
              ) =>
                selectBudget(
                  event.target.value
                )
              }
              className="
                mt-2
                min-w-64
                rounded-xl
                border
                border-white/10
                bg-zinc-950
                px-4
                py-3
                font-bold
              "
            >
              {budgets.map(
                (
                  budget
                ) => (
                  <option
                    key={
                      budget.id
                    }
                    value={
                      budget.id
                    }
                  >
                    {budget.name} ·{" "}
                    {budget.role.charAt(0).toUpperCase() +
                      budget.role.slice(1)}
                  </option>
                )
              )}
            </select>
          </div>

          {activeBudget && (
            <div
              className="
                text-right
              "
            >
              <p
                className="
                  text-sm
                  font-black
                "
              >
                {activeBudget.name}
              </p>

              <p
                className="
                  text-xs
                  capitalize
                  text-zinc-500
                "
              >
                {activeBudget.role}
              </p>
            </div>
          )}
        </section>


        {budgets.length ===
          0 ? (
          <EmptyState>
            Create your first budget to begin.
          </EmptyState>
        ) : (
          <>
            <div
              className="
                mt-8
                flex
                gap-2
                rounded-xl
                border
                border-white/10
                bg-zinc-950
                p-2
              "
            >
              {(
                [
                  "overview",
                  "history",
                  "reports",
                ] as
                  BudgetTab[]
              ).map(
                (
                  tab
                ) => (
                  <button
                    type="button"
                    key={
                      tab
                    }
                    onClick={() =>
                      setActiveTab(
                        tab
                      )
                    }
                    className={`
                      flex-1
                      rounded-lg
                      px-4
                      py-3
                      font-bold
                      capitalize

                      ${
                        activeTab ===
                        tab
                          ? "bg-white text-black"
                          : "text-zinc-400 hover:bg-zinc-900"
                      }
                    `}
                  >
                    {tab ===
                      "overview"
                      ? "Budget"
                      : tab}
                  </button>
                )
              )}
            </div>


            {activeTab ===
              "overview" && (
              <>
                <section
                  className="
                    mt-8
                    grid
                    gap-4

                    md:grid-cols-3
                  "
                >
                  <BalanceCard
                    label="Total Balance"
                    amount={
                      totalBalance
                    }
                  />

                  <BalanceCard
                    label="Savings & Investments"
                    amount={
                      savingsBalance
                    }
                  />

                  <BalanceCard
                    label="Available"
                    amount={
                      availableBalance
                    }
                  />
                </section>


                {canEdit && (
                  <section
                    className="
                      mt-6
                      grid
                      grid-cols-2
                      gap-3

                      lg:grid-cols-4
                    "
                  >
                    <ActionButton
                      primary
                      onClick={
                        openPaycheck
                      }
                    >
                      Add Paycheck
                    </ActionButton>

                    <ActionButton
                      onClick={() => {
                        resetTransactionForm();

                        setDestinationAccountId(
                          editableAccounts[0]?.id ??
                          ""
                        );

                        setModal(
                          "income"
                        );
                      }}
                    >
                      Add Income
                    </ActionButton>

                    <ActionButton
                      onClick={() => {
                        resetTransactionForm();

                        setSourceAccountId(
                          editableAccounts[0]?.id ??
                          ""
                        );

                        setModal(
                          "expense"
                        );
                      }}
                    >
                      Add Expense
                    </ActionButton>

                    <ActionButton
                      onClick={() => {
                        resetTransactionForm();

                        setSourceAccountId(
                          accounts[0]?.id ??
                          ""
                        );

                        setDestinationAccountId(
                          editableAccounts[1]?.id ??
                          editableAccounts[0]?.id ??
                          ""
                        );

                        setModal(
                          "transfer"
                        );
                      }}
                    >
                      Transfer
                    </ActionButton>
                  </section>
                )}


                <section
                  className="
                    mt-10
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
                      <h2
                        className="
                          text-3xl
                          font-black
                        "
                      >
                        Accounts
                      </h2>

                      <p
                        className="
                          mt-1
                          text-zinc-400
                        "
                      >
                        Create as many accounts as you need.
                      </p>
                    </div>

                    {isOwner && (
                      <button
                        type="button"
                        onClick={() =>
                          setModal(
                            "account"
                          )
                        }
                        className="
                          rounded-xl
                          border
                          border-white/10
                          px-4
                          py-2
                          font-bold
                        "
                      >
                        + New Account
                      </button>
                    )}
                  </div>


                  <div
                    className="
                      mt-4
                      grid
                      grid-cols-2
                      gap-2.5

                      sm:mt-5
                      sm:gap-4
                      lg:grid-cols-3
                    "
                  >
                    {accounts.map(
                      (
                        account
                      ) => (
                        <article
                          key={
                            account.id
                          }
                          className="
                            min-w-0
                            rounded-xl
                            border
                            border-white/10
                            bg-zinc-950
                            p-2.5

                            sm:rounded-2xl
                            sm:p-6
                          "
                        >
                          <div
                            className="
                              flex
                              min-w-0
                              items-center
                              justify-between
                              gap-1.5

                              sm:gap-3
                            "
                          >
                            <p
                              className="
                                min-w-0
                                flex-1
                                truncate
                                text-[8px]
                                uppercase
                                tracking-wide
                                text-zinc-500

                                min-[390px]:text-[9px]

                                sm:text-xs
                                sm:tracking-wider
                              "
                            >
                              {account.account_type}
                            </p>

                            {isOwner && (
                              <div
                                className="
                                  flex
                                  shrink-0
                                  items-center
                                  gap-1.5

                                  sm:gap-3
                                "
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    openAccountEditor(
                                      account
                                    )
                                  }
                                  className="
                                    rounded-md
                                    border
                                    border-white/10
                                    px-1.5
                                    py-1
                                    text-[8px]
                                    font-bold
                                    leading-none
                                    text-zinc-300

                                    min-[390px]:text-[9px]

                                    sm:rounded-lg
                                    sm:px-2
                                    sm:py-1
                                    sm:text-sm
                                  "
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void deleteAccount(
                                      account
                                    )
                                  }
                                  className="
                                    rounded-md
                                    border
                                    border-red-500/20
                                    px-1.5
                                    py-1
                                    text-[8px]
                                    font-bold
                                    leading-none
                                    text-red-400

                                    min-[390px]:text-[9px]

                                    sm:rounded-lg
                                    sm:px-2
                                    sm:py-1
                                    sm:text-sm
                                  "
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>

                          <h3
                            className="
                              mt-1.5
                              line-clamp-2
                              break-words
                              text-[11px]
                              font-black
                              leading-tight

                              min-[390px]:text-xs

                              sm:mt-2
                              sm:text-xl
                            "
                            title={
                              account.name
                            }
                          >
                            {account.name}
                          </h3>

                          <p
                            className="
                              mt-2
                              truncate
                              whitespace-nowrap
                              text-lg
                              font-black
                              leading-none
                              tracking-tight

                              min-[390px]:text-xl

                              sm:mt-4
                              sm:text-4xl
                              sm:tracking-normal
                            "
                          >
                            {money(
                              Number(
                                account.balance
                              )
                            )}
                          </p>

                          <div
                            className="
                              mt-2.5
                              flex
                              min-w-0
                              items-center
                              justify-between
                              gap-1
                              text-[8px]
                              leading-tight
                              text-zinc-500

                              min-[390px]:text-[9px]

                              sm:mt-3
                              sm:gap-3
                              sm:text-sm
                            "
                          >
                            <span
                              className="
                                min-w-0
                                truncate
                                whitespace-nowrap
                              "
                              title={`Default paycheck: ${Number(account.default_allocation_percent)}%`}
                            >
                              Default: {Number(account.default_allocation_percent)}%
                            </span>

                          </div>
                        </article>
                      )
                    )}
                  </div>
                </section>
              </>
            )}


            {activeTab ===
              "history" && (
              <section
                className="
                  mt-8
                "
              >
                <h2
                  className="
                    text-3xl
                    font-black
                  "
                >
                  History
                </h2>

                <div
                  className="
                    mt-6
                    space-y-3
                  "
                >
                  {transactions.length ===
                    0 ? (
                    <EmptyState>
                      No transactions yet.
                    </EmptyState>
                  ) : (
                    transactions.map(
                      (
                        transaction
                      ) => {
                        const source =
                          accounts.find(
                            (
                              account
                            ) =>
                              account.id ===
                              transaction.source_account_id
                          );

                        const destination =
                          accounts.find(
                            (
                              account
                            ) =>
                              account.id ===
                              transaction.destination_account_id
                          );

                        const transactionAllocations =
                          allocations.filter(
                            (
                              allocation
                            ) =>
                              allocation.transaction_id ===
                              transaction.id
                          );

                        return (
                          <article
                            key={
                              transaction.id
                            }
                            className="
                              flex
                              flex-wrap
                              items-start
                              justify-between
                              gap-4
                              rounded-xl
                              border
                              border-white/10
                              bg-zinc-950
                              p-5
                            "
                          >
                            <div>
                              <p
                                className="
                                  text-xs
                                  uppercase
                                  tracking-wider
                                  text-zinc-500
                                "
                              >
                                {transaction.transaction_type} · {transaction.transaction_date}
                              </p>

                              <h3
                                className="
                                  mt-1
                                  text-lg
                                  font-black
                                "
                              >
                                {transaction.description ||
                                  transaction.category}
                              </h3>

                              {transaction.transaction_type ===
                                "transfer" && (
                                <p
                                  className="
                                    mt-1
                                    text-sm
                                    text-zinc-400
                                  "
                                >
                                  {source?.name ?? "Deleted account"} → {destination?.name ?? "Deleted account"}
                                </p>
                              )}

                              {transaction.transaction_type ===
                                "expense" && (
                                <p
                                  className="
                                    mt-1
                                    text-sm
                                    text-zinc-400
                                  "
                                >
                                  Paid from {source?.name ?? "Deleted account"}
                                </p>
                              )}

                              {transaction.transaction_type ===
                                "income" && (
                                <p
                                  className="
                                    mt-1
                                    text-sm
                                    text-zinc-400
                                  "
                                >
                                  Added to {destination?.name ?? "Deleted account"}
                                </p>
                              )}

                              {transaction.transaction_type ===
                                "paycheck" && (
                                <ul
                                  className="
                                    mt-3
                                    space-y-1
                                    text-sm
                                    text-zinc-400
                                  "
                                >
                                  {transactionAllocations.map(
                                    (
                                      allocation
                                    ) => (
                                      <li
                                        key={
                                          allocation.account_id
                                        }
                                      >
                                        {accounts.find(
                                          (
                                            account
                                          ) =>
                                            account.id ===
                                            allocation.account_id
                                        )?.name ?? "Deleted account"}: {money(Number(allocation.amount))}
                                      </li>
                                    )
                                  )}
                                </ul>
                              )}
                            </div>

                            <div
                              className="
                                flex
                                shrink-0
                                flex-col
                                items-end
                                gap-3
                              "
                            >
                              <p
                                className={`
                                  text-xl
                                  font-black

                                  ${
                                    transaction.transaction_type ===
                                      "expense"
                                      ? "text-red-400"
                                      : transaction.transaction_type ===
                                        "transfer"
                                      ? "text-blue-400"
                                      : "text-green-400"
                                  }
                                `}
                              >
                                {transaction.transaction_type ===
                                  "expense"
                                  ? "-"
                                  : transaction.transaction_type ===
                                    "transfer"
                                  ? ""
                                  : "+"}

                                {money(
                                  Number(
                                    transaction.amount
                                  )
                                )}
                              </p>

                              {isOwner && (
                                <button
                                  type="button"
                                  disabled={
                                    Boolean(
                                      undoingTransactionId
                                    )
                                  }
                                  onClick={() =>
                                    void undoTransaction(
                                      transaction
                                    )
                                  }
                                  className="
                                    rounded-lg
                                    border
                                    border-red-500/25
                                    px-3
                                    py-2
                                    text-xs
                                    font-bold
                                    text-red-400

                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                  "
                                >
                                  {undoingTransactionId ===
                                    transaction.id
                                    ? "Undoing…"
                                    : "Undo"}
                                </button>
                              )}
                            </div>
                          </article>
                        );
                      }
                    )
                  )}
                </div>
              </section>
            )}


            {activeTab ===
              "reports" && (
              <section
                className="
                  mt-8
                "
              >
                <div
                  className="
                    flex
                    flex-wrap
                    items-end
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <h2
                      className="
                        text-3xl
                        font-black
                      "
                    >
                      Monthly Report
                    </h2>

                    <p
                      className="
                        mt-2
                        text-zinc-400
                      "
                    >
                      Income, spending, saving, and current balances.
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      gap-3
                    "
                  >
                    <select
                      value={
                        selectedMonth
                      }
                      onChange={(
                        event
                      ) =>
                        setSelectedMonth(
                          event.target.value
                        )
                      }
                      className="
                        rounded-xl
                        border
                        border-white/10
                        bg-zinc-950
                        px-4
                        py-3
                      "
                    >
                      {reportMonths.map(
                        (
                          reportMonth
                        ) => (
                          <option
                            key={
                              reportMonth
                            }
                            value={
                              reportMonth
                            }
                          >
                            {monthLabel(
                              reportMonth
                            )}
                          </option>
                        )
                      )}
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        window.print()
                      }
                      className="
                        rounded-xl
                        border
                        border-white/10
                        px-4
                        py-3
                        font-bold
                      "
                    >
                      Print
                    </button>
                  </div>
                </div>


                <div
                  className="
                    mt-6
                    rounded-2xl
                    bg-white
                    p-8
                    text-black
                  "
                >
                  <h3
                    className="
                      text-3xl
                      font-black
                    "
                  >
                    {monthLabel(
                      selectedMonth
                    )} Budget Report
                  </h3>

                  <div
                    className="
                      mt-8
                      grid
                      grid-cols-2
                      gap-3

                      lg:grid-cols-4
                    "
                  >
                    <ReportCard
                      label="Income"
                      amount={
                        monthlyIncome
                      }
                    />

                    <ReportCard
                      label="Expenses"
                      amount={
                        monthlyExpenses
                      }
                    />

                    <ReportCard
                      label="Added to Savings"
                      amount={
                        monthlySaved
                      }
                    />

                    <ReportCard
                      label="Savings Rate"
                      value={`${monthlyIncome > 0 ? ((monthlySaved / monthlyIncome) * 100).toFixed(1) : "0.0"}%`}
                    />
                  </div>

                  <div
                    className="
                      mt-8
                    "
                  >
                    <h4
                      className="
                        text-xl
                        font-black
                      "
                    >
                      Current Account Balances
                    </h4>

                    <div
                      className="
                        mt-3
                        grid
                        grid-cols-2
                        gap-3
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
                              flex
                              justify-between
                              rounded-xl
                              border
                              border-zinc-300
                              p-4
                            "
                          >
                            <span>
                              {account.name}
                            </span>

                            <strong>
                              {money(
                                Number(
                                  account.balance
                                )
                              )}
                            </strong>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>


      {modal ===
        "paycheck" && (
        <Modal
          title="Add Paycheck"
          onClose={() =>
            setModal(
              null
            )
          }
        >
          <MoneyInput
            label="Paycheck amount"
            value={
              amount
            }
            onChange={
              setAmount
            }
          />

          <TextInput
            label="Description"
            value={
              description
            }
            onChange={
              setDescription
            }
          />

          <DateInput
            label="Date"
            value={
              transactionDate
            }
            onChange={
              setTransactionDate
            }
          />

          <div
            className="
              grid
              grid-cols-3
              rounded-xl
              border
              border-white/10
              bg-black
              p-1
            "
          >
            {(
              [
                "default",
                "custom_percentage",
                "custom_amount",
              ] as
                PaycheckMode[]
            ).map(
              (
                mode
              ) => (
                <button
                  key={
                    mode
                  }
                  type="button"
                  onClick={() => {
                    setPaycheckMode(
                      mode
                    );

                    setPaycheckValues(
                      Object.fromEntries(
                        accounts.map(
                          (
                            account
                          ) => [
                            account.id,
                            mode ===
                              "default"
                              ? String(
                                  account.default_allocation_percent
                                )
                              : "",
                          ]
                        )
                      )
                    );
                  }}
                  className={`
                    rounded-lg
                    px-2
                    py-2
                    text-xs
                    font-bold

                    ${
                      paycheckMode ===
                      mode
                        ? "bg-white text-black"
                        : "text-zinc-500"
                    }
                  `}
                >
                  {mode ===
                    "default"
                    ? "Default"
                    : mode ===
                      "custom_percentage"
                    ? "Custom %"
                    : "Custom $"}
                </button>
              )
            )}
          </div>

          <div
            className="
              space-y-3
            "
          >
            {editableAccounts.map(
              (
                account
              ) => (
                <MoneyInput
                  key={
                    account.id
                  }
                  label={`${account.name} ${paycheckMode === "custom_amount" ? "$" : "%"}`}
                  value={
                    paycheckValues[
                      account.id
                    ] ??
                    ""
                  }
                  onChange={(
                    value
                  ) =>
                    setPaycheckValues(
                      (
                        current
                      ) => ({
                        ...current,

                        [account.id]:
                          value,
                      })
                    )
                  }
                />
              )
            )}
          </div>

          <AllocationSummary
            mode={
              paycheckMode
            }
            paycheckAmount={
              Number(
                amount
              ) ||
              0
            }
            values={
              editableAccounts.map(
                (
                  account
                ) =>
                  Number(
                    paycheckValues[
                      account.id
                    ] ??
                    0
                  )
              )
            }
          />

          <PrimaryButton
            disabled={
              saving
            }
            onClick={() =>
              void addPaycheck()
            }
          >
            Add Paycheck
          </PrimaryButton>
        </Modal>
      )}


      {modal ===
        "income" && (
        <TransactionModal
          title="Add Income"
          amount={
            amount
          }
          description={
            description
          }
          date={
            transactionDate
          }
          category={
            category
          }
          accountId={
            destinationAccountId
          }
          accounts={
            editableAccounts
          }
          accountLabel="Add to"
          saving={
            saving
          }
          onAmount={
            setAmount
          }
          onDescription={
            setDescription
          }
          onDate={
            setTransactionDate
          }
          onCategory={
            setCategory
          }
          onAccount={
            setDestinationAccountId
          }
          onClose={() =>
            setModal(
              null
            )
          }
          onSubmit={
            addIncome
          }
        />
      )}


      {modal ===
        "expense" && (
        <TransactionModal
          title="Add Expense"
          amount={
            amount
          }
          description={
            description
          }
          date={
            transactionDate
          }
          category={
            category
          }
          accountId={
            sourceAccountId
          }
          accounts={
            editableAccounts
          }
          accountLabel="Paid from"
          saving={
            saving
          }
          onAmount={
            setAmount
          }
          onDescription={
            setDescription
          }
          onDate={
            setTransactionDate
          }
          onCategory={
            setCategory
          }
          onAccount={
            setSourceAccountId
          }
          onClose={() =>
            setModal(
              null
            )
          }
          onSubmit={
            addExpense
          }
        />
      )}


      {modal ===
        "transfer" && (
        <Modal
          title="Transfer Money"
          onClose={() =>
            setModal(
              null
            )
          }
        >
          <MoneyInput
            label="Amount"
            value={
              amount
            }
            onChange={
              setAmount
            }
          />

          <TextInput
            label="Description"
            value={
              description
            }
            onChange={
              setDescription
            }
            placeholder="Optional"
          />

          <DateInput
            label="Date"
            value={
              transactionDate
            }
            onChange={
              setTransactionDate
            }
          />

          <AccountSelect
            label="From"
            accounts={
              editableAccounts
            }
            value={
              sourceAccountId
            }
            onChange={
              setSourceAccountId
            }
          />

          <AccountSelect
            label="To"
            accounts={
              editableAccounts
            }
            value={
              destinationAccountId
            }
            onChange={
              setDestinationAccountId
            }
          />

          <PrimaryButton
            disabled={
              saving
            }
            onClick={() =>
              void transferMoney()
            }
          >
            Transfer
          </PrimaryButton>
        </Modal>
      )}


      {modal ===
        "account" && (
        <Modal
          title="New Account"
          onClose={() =>
            setModal(
              null
            )
          }
        >
          <TextInput
            label="Account name"
            value={
              newAccountName
            }
            onChange={
              setNewAccountName
            }
            placeholder="Emergency Fund, Bank 2, Investments…"
          />

          <label
            className="
              block
            "
          >
            <span
              className="
                text-sm
                font-bold
              "
            >
              Account type
            </span>

            <select
              value={
                newAccountType
              }
              onChange={(
                event
              ) =>
                setNewAccountType(
                  event.target.value
                )
              }
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-white/10
                bg-black
                px-4
                py-3
              "
            >
              {[
                "spending",
                "savings",
                "checking",
                "cash",
                "investment",
                "debt",
              ].map(
                (
                  type
                ) => (
                  <option
                    key={
                      type
                    }
                    value={
                      type
                    }
                  >
                    {type}
                  </option>
                )
              )}
            </select>
          </label>

          <PrimaryButton
            disabled={
              saving
            }
            onClick={() =>
              void createAccount()
            }
          >
            Create Account
          </PrimaryButton>
        </Modal>
      )}


      {modal ===
        "editAccount" && (
        <Modal
          title="Edit Account"
          onClose={() => {
            setEditingAccountId(
              ""
            );

            setModal(
              null
            );
          }}
        >
          <TextInput
            label="Account name"
            value={
              editingAccountName
            }
            onChange={
              setEditingAccountName
            }
            placeholder="Emergency Fund, Bank 2, Investments…"
          />

          <label
            className="
              block
            "
          >
            <span
              className="
                text-sm
                font-bold
              "
            >
              Account type
            </span>

            <select
              value={
                editingAccountType
              }
              onChange={(event) =>
                setEditingAccountType(
                  event.target.value
                )
              }
              className="
                mt-2
                w-full
                rounded-xl
                border
                border-white/10
                bg-black
                px-4
                py-3
              "
            >
              {[
                "spending",
                "savings",
                "checking",
                "cash",
                "investment",
                "debt",
              ].map(
                (
                  type
                ) => (
                  <option
                    key={
                      type
                    }
                    value={
                      type
                    }
                  >
                    {type}
                  </option>
                )
              )}
            </select>
          </label>

          <PrimaryButton
            disabled={
              saving ||
              !editingAccountName.trim()
            }
            onClick={() =>
              void saveAccountEdit()
            }
          >
            Save Changes
          </PrimaryButton>
        </Modal>
      )}


      {modal ===
        "budget" && (
        <Modal
          title="New Budget"
          onClose={() =>
            setModal(
              null
            )
          }
        >
          <TextInput
            label="Budget name"
            value={
              newBudgetName
            }
            onChange={
              setNewBudgetName
            }
            placeholder="Personal, Family, Europe Trip…"
          />

          <TextInput
            label="Description"
            value={
              newBudgetDescription
            }
            onChange={
              setNewBudgetDescription
            }
            placeholder="Optional"
          />

          <PrimaryButton
            disabled={
              saving
            }
            onClick={() =>
              void createBudget()
            }
          >
            Create Budget
          </PrimaryButton>
        </Modal>
      )}




      {modal ===
        "settings" &&
        activeBudget && (
        <Modal
          title={`Budget Settings · ${activeBudget.name}`}
          onClose={() =>
            setModal(
              null
            )
          }
        >
          <div
            className="
              rounded-xl
              border
              border-white/10
              bg-black
              p-4
            "
          >
            <p
              className="
                text-sm
                font-black
              "
            >
              Editing {activeBudget.name}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-zinc-500
              "
            >
              These paycheck defaults apply only to this budget.
            </p>
          </div>

          <div>
            <p
              className="
                text-sm
                font-black
              "
            >
              Default paycheck mode
            </p>

            <div
              className="
                mt-2
                grid
                grid-cols-3
                rounded-xl
                border
                border-white/10
                bg-black
                p-1
              "
            >
              {(
                [
                  "default",
                  "custom_percentage",
                  "custom_amount",
                ] as
                  PaycheckMode[]
              ).map(
                (
                  mode
                ) => (
                  <button
                    key={
                      mode
                    }
                    type="button"
                    onClick={() =>
                      setBudgets(
                        (
                          current
                        ) =>
                          current.map(
                            (
                              budget
                            ) =>
                              budget.id ===
                              activeBudget.id
                                ? {
                                    ...budget,

                                    paycheck_mode:
                                      mode,
                                  }
                                : budget
                          )
                      )
                    }
                    className={`
                      rounded-lg
                      px-2
                      py-2
                      text-xs
                      font-bold

                      ${
                        activeBudget.paycheck_mode ===
                        mode
                          ? "bg-white text-black"
                          : "text-zinc-500"
                      }
                    `}
                  >
                    {mode ===
                      "default"
                      ? "Default %"
                      : mode ===
                        "custom_percentage"
                      ? "Custom %"
                      : "Custom $"}
                  </button>
                )
              )}
            </div>
          </div>

          <div
            className="
              space-y-3
            "
          >
            <p
              className="
                text-sm
                font-black
              "
            >
              Saved default percentages
            </p>

            {accounts.map(
              (
                account
              ) => (
                <MoneyInput
                  key={
                    account.id
                  }
                  label={`${account.name} %`}
                  value={
                    String(
                      account.default_allocation_percent
                    )
                  }
                  onChange={(
                    value
                  ) =>
                    setAccounts(
                      (
                        current
                      ) =>
                        current.map(
                          (
                            item
                          ) =>
                            item.id ===
                            account.id
                              ? {
                                  ...item,

                                  default_allocation_percent:
                                    Number(
                                      value
                                    ) ||
                                    0,
                                }
                              : item
                        )
                    )
                  }
                />
              )
            )}
          </div>

          <PrimaryButton
            disabled={
              saving
            }
            onClick={() =>
              void saveSettings()
            }
          >
            Save Settings
          </PrimaryButton>

          {!activeBudget.is_personal && (
            <div
              className="
                border-t
                border-white/10
                pt-5
              "
            >
              <p
                className="
                  text-sm
                  font-black
                  text-red-300
                "
              >
                Danger zone
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-zinc-500
                "
              >
                Deleting this budget permanently removes its accounts, history, reports, members, permissions, and pending invitations.
              </p>

              <button
                type="button"
                disabled={
                  saving
                }
                onClick={() =>
                  void deleteCurrentBudget()
                }
                className="
                  mt-4
                  w-full
                  rounded-xl
                  border
                  border-red-500/25
                  bg-red-950/20
                  px-5
                  py-3
                  font-black
                  text-red-200
                  transition

                  hover:bg-red-950/40
                  disabled:opacity-40
                "
              >
                Delete Budget
              </button>
            </div>
          )}
        </Modal>
      )}


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


function TransactionModal({
  title,
  amount,
  description,
  date,
  category,
  accountId,
  accounts,
  accountLabel,
  saving,
  onAmount,
  onDescription,
  onDate,
  onCategory,
  onAccount,
  onClose,
  onSubmit,
}: {
  title:
    string;

  amount:
    string;

  description:
    string;

  date:
    string;

  category:
    string;

  accountId:
    string;

  accounts:
    BudgetAccount[];

  accountLabel:
    string;

  saving:
    boolean;

  onAmount:
    (
      value:
        string
    ) => void;

  onDescription:
    (
      value:
        string
    ) => void;

  onDate:
    (
      value:
        string
    ) => void;

  onCategory:
    (
      value:
        string
    ) => void;

  onAccount:
    (
      value:
        string
    ) => void;

  onClose:
    () => void;

  onSubmit:
    () => Promise<void>;
}) {
  return (
    <Modal
      title={
        title
      }
      onClose={
        onClose
      }
    >
      <MoneyInput
        label="Amount"
        value={
          amount
        }
        onChange={
          onAmount
        }
      />

      <TextInput
        label="Description"
        value={
          description
        }
        onChange={
          onDescription
        }
      />

      <DateInput
        label="Date"
        value={
          date
        }
        onChange={
          onDate
        }
      />

      <label>
        <span
          className="
            text-sm
            font-bold
          "
        >
          Category
        </span>

        <select
          value={
            category
          }
          onChange={(
            event
          ) =>
            onCategory(
              event.target.value
            )
          }
          className="
            mt-2
            w-full
            rounded-xl
            border
            border-white/10
            bg-black
            px-4
            py-3
          "
        >
          {categories.map(
            (
              item
            ) => (
              <option
                key={
                  item
                }
                value={
                  item
                }
              >
                {item}
              </option>
            )
          )}
        </select>
      </label>

      <AccountSelect
        label={
          accountLabel
        }
        accounts={
          accounts
        }
        value={
          accountId
        }
        onChange={
          onAccount
        }
      />

      <PrimaryButton
        disabled={
          saving
        }
        onClick={() =>
          void onSubmit()
        }
      >
        Save
      </PrimaryButton>
    </Modal>
  );
}


function AllocationSummary({
  mode,
  paycheckAmount,
  values,
}: {
  mode:
    PaycheckMode;

  paycheckAmount:
    number;

  values:
    number[];
}) {
  const total =
    values.reduce(
      (
        sum,
        value
      ) =>
        sum +
        value,
      0
    );

  const remaining =
    mode ===
      "custom_amount"
      ? paycheckAmount -
        total
      : 100 -
        total;

  return (
    <div
      className="
        rounded-xl
        border
        border-white/10
        bg-black
        p-4
      "
    >
      <p
        className="
          text-sm
          font-bold
          text-zinc-400
        "
      >
        {mode ===
          "custom_amount"
          ? `Remaining: ${money(remaining)}`
          : `Remaining: ${remaining.toFixed(2)}%`}
      </p>
    </div>
  );
}


function BalanceCard({
  label,
  amount,
}: {
  label:
    string;

  amount:
    number;
}) {
  return (
    <article
      className="
        rounded-2xl
        border
        border-white/10
        bg-zinc-950
        p-6
      "
    >
      <p
        className="
          text-xs
          uppercase
          tracking-wider
          text-zinc-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          text-4xl
          font-black
        "
      >
        {money(
          amount
        )}
      </p>
    </article>
  );
}


function ReportCard({
  label,
  amount,
  value,
}: {
  label:
    string;

  amount?:
    number;

  value?:
    string;
}) {
  return (
    <article
      className="
        rounded-xl
        border
        border-zinc-300
        p-5
      "
    >
      <p
        className="
          text-xs
          uppercase
          text-zinc-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          text-3xl
          font-black
        "
      >
        {value ??
          money(
            amount ??
            0
          )}
      </p>
    </article>
  );
}


function ActionButton({
  children,
  onClick,
  primary =
    false,
}: {
  children:
    ReactNode;

  onClick:
    () => void;

  primary?:
    boolean;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        rounded-xl
        px-4
        py-4
        font-black

        ${
          primary
            ? "bg-white text-black"
            : "border border-white/10 bg-zinc-950"
        }
      `}
    >
      {children}
    </button>
  );
}


function EmptyState({
  children,
}: {
  children:
    ReactNode;
}) {
  return (
    <div
      className="
        mt-8
        rounded-xl
        border
        border-dashed
        border-white/10
        p-8
        text-center
        text-zinc-500
      "
    >
      {children}
    </div>
  );
}


function Modal({
  title,
  onClose,
  children,
}: {
  title:
    string;

  onClose:
    () => void;

  children:
    ReactNode;
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[500]
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-black/80
        p-4
        backdrop-blur-md
      "
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        className="
          my-8
          w-full
          max-w-lg
          space-y-4
          rounded-2xl
          border
          border-white/10
          bg-zinc-950
          p-6
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <h2
            className="
              text-2xl
              font-black
            "
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={
              onClose
            }
            className="
              text-zinc-400
            "
          >
            ✕
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}


function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string
    ) => void;

  placeholder?:
    string;
}) {
  return (
    <label>
      <span
        className="
          text-sm
          font-bold
        "
      >
        {label}
      </span>

      <input
        value={
          value
        }
        placeholder={
          placeholder
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="
          mt-2
          w-full
          rounded-xl
          border
          border-white/10
          bg-black
          px-4
          py-3
        "
      />
    </label>
  );
}


function MoneyInput({
  label,
  value,
  onChange,
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string
    ) => void;
}) {
  return (
    <label>
      <span
        className="
          text-sm
          font-bold
        "
      >
        {label}
      </span>

      <input
        type="number"
        min="0"
        step="0.01"
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="
          mt-2
          w-full
          rounded-xl
          border
          border-white/10
          bg-black
          px-4
          py-3
        "
      />
    </label>
  );
}


function DateInput({
  label,
  value,
  onChange,
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string
    ) => void;
}) {
  return (
    <label>
      <span
        className="
          text-sm
          font-bold
        "
      >
        {label}
      </span>

      <input
        type="date"
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="
          mt-2
          w-full
          rounded-xl
          border
          border-white/10
          bg-black
          px-4
          py-3
        "
      />
    </label>
  );
}


function AccountSelect({
  label,
  accounts,
  value,
  onChange,
}: {
  label:
    string;

  accounts:
    BudgetAccount[];

  value:
    string;

  onChange:
    (
      value:
        string
    ) => void;
}) {
  return (
    <label>
      <span
        className="
          text-sm
          font-bold
        "
      >
        {label}
      </span>

      <select
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="
          mt-2
          w-full
          rounded-xl
          border
          border-white/10
          bg-black
          px-4
          py-3
        "
      >
        {accounts.map(
          (
            account
          ) => (
            <option
              key={
                account.id
              }
              value={
                account.id
              }
            >
              {account.name} — {money(Number(account.balance))}
            </option>
          )
        )}
      </select>
    </label>
  );
}


function PrimaryButton({
  onClick,
  children,
  disabled =
    false,
}: {
  onClick:
    () => void;

  children:
    ReactNode;

  disabled?:
    boolean;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      disabled={
        disabled
      }
      className="
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
      {children}
    </button>
  );
}
