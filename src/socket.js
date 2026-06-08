import { io } from 'socket.io-client'

// autoConnect: false — we connect explicitly inside OrdersPage on mount
// so the socket only exists while the orders page is active.
const socket = io({ autoConnect: false })

export default socket
