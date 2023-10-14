const errorHandler = (err, req, res, next) => {
    console.log(err);
     
    if(err.name === "InvalidCredentials") {
        res.status(400).json({ message: "Wrong email or password"})
    } else if (err.name === "Unauthenticated") {
        res.status(400).json({ message: "Unauthenticated"})
    } else if (err.name === "JsonWebTokenError") {
        res.status(400).json({ message: "Invalid Token / Token Error"})
    } else if (err.name === "ErrorNotFound") {
        res.status(404).json({ message: "Error Not Found"})
    } else if (err.name === "Unauthorized") {
        res.status(403).json({ message: "Unauthorized"})
    }
    else {
        res.status(500).json({ message: "Internal Server Error "})
    }
}

module.exports = errorHandler; 