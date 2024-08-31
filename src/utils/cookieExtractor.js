/**
 * Extracts the JWT from the 'Authorization' header of the request.
 * @param {Object} req - The request object.
 * @returns {String|null} - The JWT if found, otherwise null.
 */
export function cookieExtractor(req) {
    if (req && req.cookies) {
        return req.cookies['token'] || null;  // Assuming the cookie name is 'token'
    }
    return null;
}
