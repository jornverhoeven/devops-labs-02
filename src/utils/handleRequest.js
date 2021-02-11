
export default function handleRequest(fn) {
    return async (req, res, next) => {
        try {
            const { data, statusCode = 200 } = await fn(req, res, next);
            return res
                .contentType('application/json')
                .status(statusCode)
                .json(data);
        } catch (err) {
            next(err);
        }
    }
}