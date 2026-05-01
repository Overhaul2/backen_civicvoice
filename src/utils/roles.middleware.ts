
// import { Request, Response, NextFunction } from 'express';

// export const authorize = (requiredRoles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const user = (req as any).user; // Supposant que ton auth-middleware a injecté l'user ici

//     if (!user || !requiredRoles.includes(user.role)) {
//       return res.status(403).json({ 
//         message: "Accès refusé : privilèges insuffisants pour cette action citoyenne." 
//       });
//     }
//     next();
//   };
// };