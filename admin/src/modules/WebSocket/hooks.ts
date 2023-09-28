import { useContext } from "react";
import { SocketContext } from ".";

export const useWebsocket = () => useContext(SocketContext);
