// Script to seed database using the API
// Run this after deployment to seed initial data

const DATABASE_URL = process.env.DATABASE_URL;

async function seedDatabase() {
  const response = await fetch('http://localhost:3000/api/seed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  const result = await response.json();
  console.log('Seed result:', result);
}

seedDatabase().catch(console.error);
