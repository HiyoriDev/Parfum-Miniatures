const perfumes = Array.from({ length: 11020 }, (_, index) => ({
  id: index + 1,

  brand: [
    "Dior",
    "Chanel",
    "Guerlain",
    "YSL",
    "Givenchy",
    "Lancome",
    "Hermès",
    "Cacharel",
  ][index % 8],

  name: `Miniature #${index + 1}`,

  image: `https://placehold.co/400x500?text=Parfum+${index + 1}`,
}));

export default perfumes;
