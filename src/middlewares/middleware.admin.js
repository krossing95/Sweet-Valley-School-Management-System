import * as JWT from 'jsonwebtoken'

export default function admin_middleware() {
    const { verify } = JWT.default
    const ERROR = 'Unauthorized request', WSWW = 'Whoops! Something went wrong'
    const cookies = req.cookies
    if (typeof cookies === 'undefined') return res.status(401).json({ error: ERROR })
    if (typeof cookies.__appServiceKey === 'undefined' || typeof cookies.__signedInUserObj === 'undefined') return res.status(401).json({ error: ERROR })
    const __appServiceKey = cookies.__appServiceKey
    const userObj = cookies.__signedInUserObj
    return verify(__appServiceKey, process.env.SVCMSMS_JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(401).json({ error: ERROR })
        if (typeof decoded.userObj === 'undefined') return res.status(401).json({ error: ERROR })
        const { username, user_id, email, usertype } = decoded.userObj
        const user = typeof userObj === 'string' ? JSON.parse(userObj) : userObj
        if (!user) return res.status(500).json({ error: WSWW })
        if (user.username !== username || user.user_id !== user_id || user.email !== email || user.usertype !== usertype) return res.status(401).json({ error: ERROR })
        // if (usertype === Number(process.env.SVCMSMS_ADMIN)) {
        //     const tokenValidity = await checkToken(__appServiceKey, user_id)
        //     if (tokenValidity === true) return next()
        //     return res.status(401).json({ error: ERROR })
        // } return res.status(401).json({ error: ERROR })
    })
}