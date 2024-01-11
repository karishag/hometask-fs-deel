const getProfile = async (req, res, next) => {
    const { Profile } = req.app.get('models')
    const profileId = req.headers['profile_id'];

    if (!profileId) return res.status(404).json({ error: 'No profile id provided' });

    const profile = await Profile.findOne({ where: { id: req.headers['profile_id'] || 0 } })
    if (!profile) return res.status(401).json({ error: 'No profile found' });
    req.profile = profile
    next()
}
module.exports = { getProfile }