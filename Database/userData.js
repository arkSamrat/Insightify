import mongoose from "mongoose";


const userData=mongoose.Schema(
    {
        companyName:String,
        domainName:String,
        email:String,
        password:String
    }
);

const userdata=mongoose.model('userData',userData);

export default userdata;

