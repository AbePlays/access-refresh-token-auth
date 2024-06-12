import express from 'express'
import jwt from 'jsonwebtoken'

const app = express()

const users = {
  admin: {
    username: 'admin',
    password: 'password',
  },
}

app.use(express.json())

const SERVER_SECRET = 'secretKey'

// API to login a user
app.post('/login', (req, res) => {
  const { username, password } = req.body
  if (username === users.admin.username && password === users.admin.password) {
    try {
      // If a user is trying to login, send them the access token and the refresh token in the response
      const accessToken = jwt.sign({ username }, SERVER_SECRET, {
        expiresIn: '1h',
      })
      const refreshToken = jwt.sign({ username }, SERVER_SECRET, {
        expiresIn: '7d',
      })
      res.status(200).json({ accessToken, refreshToken })
    } catch (e) {
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(401).json({ message: 'Invalid username or password' })
  }
})

// API to refresh the access token
app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' })
  }

  try {
    // Verify the refresh token
    if (jwt.verify(refreshToken, SERVER_SECRET)) {
      const { username } = jwt.decode(refreshToken)

      // Generate a new access token
      const accessToken = jwt.sign({ username }, SERVER_SECRET, {
        expiresIn: '1h',
      })
      res.status(200).json({ accessToken })
    } else {
      res.status(401).json({ message: 'Invalid refresh token' })
    }
  } catch (e) {
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.listen(8000, () => {
  console.log('Server is running on http://localhost:8000')
})
