import AuthContext from "./auth-context";
import React, { useReducer } from "react";
import { IUser } from "@/shared/models/user";
import AUTH_ACTIONS from "./enums";
import { setUser, deleteUser } from "@/utils/secure-store";


interface Action {
    type: string;
    payload?: any;
}

interface State {
    isLoading: boolean;
    token: string | null;
    user: IUser | null;
    refreshToken: string | null;
    }

const initialState = {
  isLoading: false,
  token: null,
  user: null,
  refreshToken: null,
}

const AuthProvider = (props: any) => {

  const [state, dispatch] = useReducer((prevState: State, action: Action) => {
    const {payload} = action
    switch (action.type) {
      case AUTH_ACTIONS.LOGIN:
        setUser(payload.user);
        return {
          ...prevState,
          user: payload.user,
          token: payload.token,
          refreshToken: payload.refreshToken,
        }
      case AUTH_ACTIONS.LOGOUT:
        deleteUser();
        return initialState
      default:
        return prevState
    }

  }, initialState)

  return (
      <AuthContext.Provider value={{state, dispatch}}>
        {props.children}
      </AuthContext.Provider>
  )
}

export default AuthProvider;