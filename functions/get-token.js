import bcrypt from "bcryptjs";
import { createJwtCookie } from "../helpers/jwt-helper"

export async function handler(event) {
  const dbClient = createClient()
  let errorStatusCode = 500

  try {
    const passwordHash1 = await bcrypt.hash('password1', 10);
    const passwordHash2 = await bcrypt.hash('password2', 10);

    // 1. Connect to the database and get a reference to the `users` collection
    const users = [{clientID:123456, email:"email1@domain.com", password: passwordHash1}, { clientID:123457, email:"email2@domain.com", password: passwordHash2 }]

    // 2. Get the email and password from the request body
    const { email, password } = JSON.parse(event.body)

    // 3. Check to see if the user exists, if not return error (401 Unauthorized)
    const existingUser = await users.findOne({ email })
    if (existingUser == null) {
      errorStatusCode = 401
      throw new Error(`Invalid password or email`)
    }

    // 4. Compare the password, if it doesn't match return error (401 Unauthorized)
    const matches = await bcrypt.compare(password, existingUser.password)
    if (!matches) {
      errorStatusCode = 401
      throw new Error(`Invalid password or email`)
    }

    // 5. Create a JWT and serialize as a secure http-only cookie
    const clientID = existingUser.clientID
    const jwtCookie = createJwtCookie(clientID, email)

    // 6. Return the user id and a Set-Cookie header with the JWT cookie
    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": jwtCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: clientID, email }),
    }
  } catch (err) {
    return {
      statusCode: errorStatusCode,
      body: JSON.stringify({ msg: err.message }),
    }
  } finally {
  }
}