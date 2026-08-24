import { createContext } from "react";

import type { AuthContextValue } from "../Common/interface";


export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

