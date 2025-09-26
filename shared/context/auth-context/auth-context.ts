import { createContext, Context } from "react";


const AuthContext:Context<any> = createContext({
    state:{},
    dispatch:() :void => {},
});

export default AuthContext;