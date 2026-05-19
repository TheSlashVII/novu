const PORT: number = 8000 // django's port
export const development:boolean = true // change development
const baseServerURLDevelopment:string = `http://localhost:${PORT}/api/users`;
const baseChatURLDevelopment:string = `http://localhost:${PORT}`;
let url:string = "/api/users"
let chatURL:string = "/api/chat";
if (development) {
    url = baseServerURLDevelopment
}
export const baseServerURL:string = url;
export const baseChatURL:string = baseChatURLDevelopment;
