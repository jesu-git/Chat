import bcrypt from "bcrypt"



export const verificador = (password, passwordOriginal) =>  bcrypt.compare(password, passwordOriginal) 
export const createHash = (password)=> bcrypt.hashSync(password , bcrypt.genSaltSync(10))