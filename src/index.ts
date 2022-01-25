import { Server } from 'socket.io'

const io = new Server()
io.listen(5000, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

console.log('Server listening')

io.on('connection', (socket) => {
  const username: string = socket.handshake.query.username as string
  const address: string = socket.handshake.address
  if (!username) return
  console.log(`${address}: ${username} connected`)
  socket.join(username)
  socket.on(
    'send-message',
    ({ recipients, text }: { recipients: Array<string>, text: string }) => {
      recipients.forEach((recipient) => {
        const otherClientRecipients: Array<string> = recipients
          .filter((r) => r !== recipient)
        otherClientRecipients.push(username)
        socket.broadcast
          .to(recipient)
          .emit('recieve-message', {
            recipients: otherClientRecipients,
            sender: username,
            text
          })
      })
      console.log(
        `${address}: ${username} said ${text} to ${recipients.join(', ')}`)
    })
  socket.on('disconnect', () => console.log(`${username} disconnected`))
})
