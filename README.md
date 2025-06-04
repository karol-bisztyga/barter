# Barter 🤝

## What it is ℹ️

A Tinder-style mobile app with a medieval feeling for cash-free exchanges. Upload your items, swipe through others', and when there’s a match — set up a trade!

## Stack 🛠️

### Mobile App 📱

- TypeScript
- React Native
- Expo
- Expo Router

### Server 🌐

- TypeScript
- Node.js
- Express
- Postgres

### Other

- socket.io for communication
- minio / backblaze for storage (AWS S3 compatible)

## Setup 🚀

⚠️ You will have to properly set up env variables before you're able to run anything

### Backend 🌐

```
cd backend
yarn run setup:reset:hardcoded:local
yarn dev
```

### Mobile 📱

```
cd mobile
yarn run env:refresh:local
npx expo start
```

## Previews 🎬

### Jester 🃏

#### Playing With Jester

<img src="media/jester.gif" alt="Demo" width="200"/>

### Profile Tab 👤

#### Update Info

<img src="media/profile/update_info.gif" alt="Demo" width="200"/>

#### Update Profile Picture

<img src="media/profile/update_profile_pic.gif" alt="Demo" width="200"/>

#### Add Item

<img src="media/profile/add_item.gif" alt="Demo" width="200"/>

#### Change Item Picture

<img src="media/profile/change_item_pic.gif" alt="Demo" width="200"/>

#### Update Item

<img src="media/profile/update_item.gif" alt="Demo" width="200"/>

#### Remove Item

<img src="media/profile/remove_item.gif" alt="Demo" width="200"/>

### Hunt Tab 🎯

#### Swipe & Match

<img src="media/hunt/swipe.gif" alt="Demo" width="200"/>

### Exchanges Tab 🤝

#### Chat

<img src="media/exchanges/chat.gif" alt="Demo" width="200"/>

#### Unmatch

<img src="media/exchanges/unmatch.gif" alt="Demo" width="200"/>
