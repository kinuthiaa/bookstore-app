import mongoose from 'mongoose';


export const connDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("Hi jimmy I'm the database string")
    } catch (error) {
        console.error("sth went wrong:", error.message);
        process.exit(1);//exti = true
    }
}