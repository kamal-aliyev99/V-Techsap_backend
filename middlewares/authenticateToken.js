const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    // next()
    // return;

    const accessToken = req.cookies?.accessToken; 
    const refreshToken = req.cookies?.refreshToken; 
    

    if (!accessToken) {
        if (!refreshToken) {
            next({
                statusCode: 401,
                message: "Token is required", 
            })
            return;
        } 
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => { 
            if (err) {
                next({
                    statusCode: 403,
                    message: "Invalid Refresh Token",
                })
                return;
            }
            const { iat, exp, ...newUser} = {...user}
    
            const newAccessToken = jwt.sign(newUser, process.env.JWT_ACCESS_SECRET, { expiresIn: "1h" });
    
            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,          //  XSS'e qarsi
                // secure: true,         //  https
                // sameSite: "strict",   //  ancag eyni domein'den gelen sorgular (CSRF'e qarsi)
                maxAge: 60 * 60 * 1000   //  1 saat
            });            
    
            req.user = newUser;
            
            next();
            return;
        });


    } else {

        jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, (err, user) => {            
            if (err) {
                if (refreshToken) {
                    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => { 
                        if (err) {
                            next({
                                statusCode: 403,
                                message: "Invalid Refresh Token",
                            })
                            return;
                        }
                        const { iat, exp, ...newUser} = {...user}
                
                        const newAccessToken = jwt.sign(newUser, process.env.JWT_ACCESS_SECRET, { expiresIn: "1h" });
                
                        res.cookie("accessToken", newAccessToken, {
                            httpOnly: true,          //  XSS'e qarsi
                            // secure: true,         //  https
                            // sameSite: "strict",   //  ancag eyni domein'den gelen sorgular (CSRF'e qarsi)
                            maxAge: 60 * 60 * 1000   //  1 saat
                        });            
                
                        req.user = newUser;
                        
                        next();
                        return;
                    });
                }
                next({
                    statusCode: 401,
                    message: "Invalid or expired Access Token",
                })
                return;
            }

            req.user = user; // İstifadəçi məlumatını request obyektinə əlavə etmek ucun
            next(); 
        });
    }
}

module.exports = authenticateToken