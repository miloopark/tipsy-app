const adjectives = [
  'Unhinged', 'Feral', 'Chaotic', 'Lowkey', 'Highkey', 'Slay', 'Vibe', 'Based',
  'Bussin', 'Goated', 'Snatched', 'Sheesh', 'Valid', 'Mid', 'Fire', 'Zesty',
  'Delulu', 'Salty', 'Boujee', 'Goofy', 'Rizz', 'Skibidi', 'Sigma', 'Alpha',
  'Cracked', 'Cursed', 'Blessed', 'Thicc', 'Smol', 'Chonky', 'Beefy', 'Spicy',
  'Crispy', 'Saucy', 'Cheesy', 'Soggy', 'Crusty', 'Silly', 'Gremlin', 'Goblin'
];

const nouns = [
  'Raccoon', 'Possum', 'Frog', 'Shrimp', 'Capybara', 'Axolotl', 'Blob', 'Bean',
  'Potato', 'Noodle', 'Nugget', 'Muffin', 'Pickle', 'Pretzel', 'Burrito', 'Taco',
  'Donut', 'Waffle', 'Bagel', 'Biscuit', 'Croissant', 'Dumpling', 'Ravioli', 'Sushi',
  'Gecko', 'Hamster', 'Otter', 'Seal', 'Penguin', 'Platypus', 'Narwhal', 'Llama',
  'Alpaca', 'Sloth', 'Koala', 'Panda', 'Moth', 'Bee', 'Crab', 'Lobster'
];

export function generateRandomUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);

  return `${adjective}${noun}${number}`;
}

export function generateUniqueUsername(): string {
  // Generate with timestamp to ensure uniqueness
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const uniqueId = Date.now().toString().slice(-4);

  return `${adjective}${noun}${uniqueId}`;
}
