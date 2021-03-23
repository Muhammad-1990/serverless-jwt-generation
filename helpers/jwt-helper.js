import jwt from "jsonwebtoken"
import cookie from "cookie"
/*
 * Generate a JWT with the user ID and email as the payload,
 * then serialize to a secure HTTP-only cookie.
 */
function createJwtCookie(clientId, email) {

    // 6. Get the secret key, used to sign the JWT, from an environment variable
    const secretKey =
        "-----BEGIN RSA PRIVATE KEY-----\n" +
        process.env.JWT_SECRET_KEY +
        "\n-----END RSA PRIVATE KEY-----";
    // 7. Create a JWT with the registered user and email as the payload
    const token = jwt.sign({ clientId, email }, secretKey, {
        algorithm: "RS256",
        expiresIn: "100 days",
    })

    // 8. Serialize the JWT in a secure http-only cookie
    const jwtCookie = cookie.serialize("jwt", token, {
        secure: process.env.NETLIFY_DEV !== "true",
        httpOnly: true,
        path: "/",
    })

    return jwtCookie
}

function clearCookie() {
    return "jwt=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }

export { createJwtCookie, clearCookie }