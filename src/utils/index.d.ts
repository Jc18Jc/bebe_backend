declare namespace Express {
  export interface Request {
    user?: DecodedUser;
    headers: { authorization: string };
  }
}
