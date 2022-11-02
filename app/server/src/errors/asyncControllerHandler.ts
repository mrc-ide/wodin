// This method should be used to wrap any async controller methods to ensure error handling is appliedy
// (not required for controller methods which only use apiService, which already handles errors)
export default async (next: Function, method: Function) => {
    try {
        await method();
    } catch (error) {
        next(error);
    }
};
