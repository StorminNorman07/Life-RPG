import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/utils/supabase/server";

import {
  admin,
} from "@/utils/supabase/admin";


export async function DELETE(
  request:
    Request
) {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();


  if (
    !user
  ) {
    return NextResponse.json(
      {
        error:
          "You are not signed in.",
      },
      {
        status:
          401,
      }
    );
  }


  const body =
    await request.json();

  const confirmation =
    String(
      body.confirmation ??
      ""
    )
      .trim()
      .toUpperCase();


  if (
    confirmation !==
    "DELETE"
  ) {
    return NextResponse.json(
      {
        error:
          'Type "DELETE" to confirm.',
      },
      {
        status:
          400,
      }
    );
  }


  const {
    error:
      deleteError,
  } =
    await admin.auth.admin.deleteUser(
      user.id,
      false
    );


  if (
    deleteError
  ) {
    return NextResponse.json(
      {
        error:
          deleteError.message,
      },
      {
        status:
          500,
      }
    );
  }


  return NextResponse.json({
    deleted:
      true,
  });
}