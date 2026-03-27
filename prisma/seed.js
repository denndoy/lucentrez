/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "Neon Drift Oversized Tee",
        slug: "neon-drift-oversized-tee",
        price: 289000,
        description: "Heavyweight cotton tee with oversized silhouette and fluorescent back graphic.",
        images: ["/products/tee-01.svg", "/products/tee-02.svg"],
        shopeeUrl: "https://shopee.co.id/",
        category: "Tops",
      },
      {
        name: "Shadow Cargo Pants",
        slug: "shadow-cargo-pants",
        price: 429000,
        description: "Relaxed tapered cargo pants with utility pockets and technical fabric.",
        images: ["/products/pants-01.svg", "/products/pants-02.svg"],
        shopeeUrl: "https://shopee.co.id/",
        category: "Bottoms",
      },
      {
        name: "Voltage Coach Jacket",
        slug: "voltage-coach-jacket",
        price: 559000,
        description: "Water-resistant coach jacket with reflective logo and contrast piping.",
        images: ["/products/jacket-01.svg", "/products/jacket-02.svg"],
        shopeeUrl: "https://shopee.co.id/",
        category: "Outerwear",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.galleryImage.createMany({
    data: [
      { title: "Night Alley Drop", imageUrl: "/gallery/look-01.svg" },
      { title: "Concrete Pulse", imageUrl: "/gallery/look-02.svg" },
      { title: "Subway Frequency", imageUrl: "/gallery/look-03.svg" },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
