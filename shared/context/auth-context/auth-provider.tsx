import React, { useReducer, useEffect } from "react";
import AuthContext from "./auth-context";
import { IUser } from "@/shared/models/user";
import AUTH_ACTIONS from "./enums";
import { supabase } from "@/utils/supabase";

interface Action {
    type: string;
    payload?: any;
}

interface State {
    isLoading: boolean;
    token: string | null;
    user: IUser | null;
    viewMode: 'client' | 'professional';
    refreshToken: string | null;
}

const initialState: State = {
  isLoading: true,
  token: null,
  user: null,
  refreshToken: null,
  viewMode: 'client',
}

const AuthProvider = (props: any) => {
  const [state, dispatch] = useReducer((prevState: State, action: Action): State => { 
    switch (action.type) {
      case AUTH_ACTIONS.LOGIN:
        return {
          ...prevState,
          user: action.payload.user,
          viewMode: (action.payload.user.rol === 'professional' ? 'professional' : 'client') as 'client' | 'professional',
          token: action.payload.token,
          isLoading: false,
        };
      case 'TOGGLE_VIEW_MODE':
        return {
          ...prevState,
          viewMode: prevState.viewMode === 'client' ? 'professional' : 'client'
        };
      case AUTH_ACTIONS.LOGOUT:
        return { ...initialState, isLoading: false };
      case AUTH_ACTIONS.SET_LOADING:
        return { ...prevState, isLoading: action.payload };
      default:
        return prevState;
    }
  }, initialState);

  useEffect(() => {
    const handleSession = async (session: any) => {
      if (session) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) throw error;

          let professionalData = null;
          if (profile && profile.rol === 'professional') {
             const { data } = await supabase
              .from('professionals')
              .select('titulo, especialidad')
              .eq('id', profile.id)
              .single();
             professionalData = data;
          }

          if (profile) {
            dispatch({
              type: AUTH_ACTIONS.LOGIN,
              payload: {
                token: session.access_token,
                user: {
                  id: profile.id,
                  nombre: profile.nombre,
                  apellido: profile.apellido,
                  avatar_url: profile.avatar_url,
                  telefono: profile.telefono,
                  email: profile.email,
                  direccion_legible: profile.direccion_legible,
                  ciudad: profile.ciudad,
                  peso: profile.peso,
                  altura: profile.altura,
                  fecha_actualizacion_peso: profile.fecha_actualizacion_peso,
                  rol: profile.rol,
                  titulo: professionalData?.titulo,
                  especialidad: professionalData?.especialidad
                }
              }
            });
          }
        } catch (err) {
          console.error("Error cargando perfil:", err);
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
      <AuthContext.Provider value={{state, dispatch}}>
        {props.children}
      </AuthContext.Provider>
  )
}

export default AuthProvider;