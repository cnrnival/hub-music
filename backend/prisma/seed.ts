import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create genres
  const genres = [
    { name: 'Eletrônica', slug: 'eletronica' },
    { name: 'Rock', slug: 'rock' },
    { name: 'Pop', slug: 'pop' },
    { name: 'Hip Hop / Rap', slug: 'hip-hop-rap' },
    { name: 'Jazz', slug: 'jazz' },
    { name: 'Clássica', slug: 'classica' },
    { name: 'Ambient', slug: 'ambient' },
    { name: 'Lo-Fi', slug: 'lo-fi' },
    { name: 'Indie', slug: 'indie' },
    { name: 'Metal', slug: 'metal' },
    { name: 'Funk / Soul', slug: 'funk-soul' },
    { name: 'Reggae', slug: 'reggae' },
    { name: 'Country', slug: 'country' },
    { name: 'Folk', slug: 'folk' },
    { name: 'R&B', slug: 'rnb' },
    { name: 'World', slug: 'world' },
    { name: 'Soundtrack', slug: 'soundtrack' },
    { name: 'Experimental', slug: 'experimental' }
  ];

  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: genre
    });
  }
  console.log('✅ Genres created');

  // Create demo users
  const passwordHash = await argon2.hash('demo123', {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@hubmusic.local' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@hubmusic.local',
      passwordHash,
      displayName: 'Demo User',
      bio: 'Usuário de demonstração do Hub Music',
      accountType: 'BOTH'
    }
  });

  const artistUser = await prisma.user.upsert({
    where: { email: 'artist@hubmusic.local' },
    update: {},
    create: {
      username: 'artist',
      email: 'artist@hubmusic.local',
      passwordHash,
      displayName: 'Demo Artist',
      bio: 'Artista independente no Hub Music',
      accountType: 'ARTIST'
    }
  });

  console.log('✅ Demo users created');

  // Create some sample playlists
  const playlist1 = await prisma.playlist.create({
    data: {
      userId: demoUser.id,
      name: 'Minhas Favoritas',
      description: 'Playlist com minhas músicas favoritas',
      visibility: 'PUBLIC'
    }
  });

  const playlist2 = await prisma.playlist.create({
    data: {
      userId: demoUser.id,
      name: 'Chill Vibes',
      description: 'Músicas relaxantes para estudar/trabalhar',
      visibility: 'PUBLIC'
    }
    });

  console.log('✅ Sample playlists created');

  // Create follow relationship
  await prisma.follow.upsert({
    where: {
      followerId_followedId: {
        followerId: demoUser.id,
        followedId: artistUser.id
      }
    },
    update: {},
    create: {
      followerId: demoUser.id,
      followedId: artistUser.id
    }
  });

  console.log('✅ Follow relationships created');

  console.log('🎉 Seed completed successfully!');
  console.log(`
  Demo credentials:
  - Email: demo@hubmusic.local | Password: demo123
  - Email: artist@hubmusic.local | Password: demo123
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });