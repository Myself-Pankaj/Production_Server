/* eslint-disable no-unused-vars */
export default (err, _, res, __) => {
    res.status(err.statusCode).json(err)
}
