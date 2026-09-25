import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/utils/supabase/server";

import {
  admin,
} from "@/utils/supabase/admin";


function normalizeUsername(
  value:
    unknown
) {
  return String(
    value ??
    ""
  )
    .trim()
    .toLowerCase();
}


function usernameToInternalEmail(
  username:
    string
) {
  return `${username}@users.life-rpg.invalid`;
}


export async function PATCH(
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

  const username =
    normalizeUsername(
      body.username
    );

  const displayName =
    String(
      body.displayName ??
      ""
    ).trim();


  if (
    !/^[a-z0-9_]{3,24}$/.test(
      username
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Username must be 3–24 characters using lowercase letters, numbers, or underscores.",
      },
      {
        status:
          400,
      }
    );
  }


  if (
    displayName.length <
      1 ||
    displayName.length >
      40
  ) {
    return NextResponse.json(
      {
        error:
          "Display name must be between 1 and 40 characters.",
      },
      {
        status:
          400,
      }
    );
  }


  const {
    data:
      currentProfile,

    error:
      currentProfileError,
  } =
    await admin
      .from(
        "profiles"
      )
      .select(
        "username, display_name"
      )
      .eq(
        "id",
        user.id
      )
      .single();


  if (
    currentProfileError ||
    !currentProfile
  ) {
    return NextResponse.json(
      {
        error:
          "Your profile could not be loaded.",
      },
      {
        status:
          500,
      }
    );
  }


  const oldUsername =
    String(
      currentProfile.username
    );

  const usernameChanged =
    username !==
    oldUsername.toLowerCase();


  if (
    usernameChanged
  ) {
    const {
      data:
        existingProfile,
    } =
      await admin
        .from(
          "profiles"
        )
        .select(
          "id"
        )
        .eq(
          "username",
          username
        )
        .neq(
          "id",
          user.id
        )
        .maybeSingle();


    if (
      existingProfile
    ) {
      return NextResponse.json(
        {
          error:
            "That username is already taken.",
        },
        {
          status:
            409,
        }
      );
    }
  }


  const {
    error:
      profileUpdateError,
  } =
    await admin
      .from(
        "profiles"
      )
      .update({
        username,
        display_name:
          displayName,
      })
      .eq(
        "id",
        user.id
      );


  if (
    profileUpdateError
  ) {
    return NextResponse.json(
      {
        error:
          profileUpdateError.code ===
            "23505"
            ? "That username is already taken."
            : profileUpdateError.message,
      },
      {
        status:
          profileUpdateError.code ===
            "23505"
            ? 409
            : 500,
      }
    );
  }


  if (
    usernameChanged
  ) {
    const internalEmail =
      usernameToInternalEmail(
        username
      );


    const {
      error:
        authUpdateError,
    } =
      await admin.auth.admin.updateUserById(
        user.id,
        {
          email:
            internalEmail,

          email_confirm:
            true,

          user_metadata: {
            ...user.user_metadata,

            username,

            display_name:
              displayName,
          },
        }
      );


    if (
      authUpdateError
    ) {
      await admin
        .from(
          "profiles"
        )
        .update({
          username:
            oldUsername,

          display_name:
            currentProfile.display_name,
        })
        .eq(
          "id",
          user.id
        );


      return NextResponse.json(
        {
          error:
            "The username could not be connected to your login. No changes were kept.",
        },
        {
          status:
            500,
        }
      );
    }


    await admin
      .from(
        "account_private"
      )
      .update({
        login_email:
          internalEmail,
      })
      .eq(
        "user_id",
        user.id
      );
  } else {
    await admin.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,

          username,

          display_name:
            displayName,
        },
      }
    );
  }


  return NextResponse.json({
    username,
    displayName,
  });
}