import mongoose from "mongoose";
async function main(){
    //await mongoose.connect('mongodb://localhost:27017/NomeDoBancoNoMongo')
    await mongoose.connect('mongodb://localhost:27017/todo');
    console.log("conectou MongoDB");
}
main().catch((err) => {
        console.log(err);
})
export default mongoose;