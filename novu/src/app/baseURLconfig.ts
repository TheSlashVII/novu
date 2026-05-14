const PORT: number = 8000 // django's port
const baseServerURLDevelopment:string = `http://localhost:${PORT}/api/users`;
const development:boolean = true // change development
let url:string = "/api/users"

if (development) {
    url = baseServerURLDevelopment
}
export const baseServerURL:string = url;

