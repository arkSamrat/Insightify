
import jwt from 'jsonwebtoken'


let isLoggedIn=(req,res,next)=>
{
    
    try{
        let token=req.cookies.token;
        if(!token) return res.status(400).render('login.ejs');

        let decoded=jwt.verify(token,"ArpanKheer");
        //console.log(decoded);
        //{will update with alert}
        if(decoded)
        {
            req.user_email=decoded.email;
            next();
        }
        else  res.render('login.ejs');
    }
    catch(Error)
    {
        res.status(400).send('Need to Login First');
    }
}

export default isLoggedIn;