
import Navbar from '@/components/Navbar';

const Donate = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Donate Items</h1>
        <p>Donate clothing to NGOs and earn impact points</p>
      </div>
    </div>
  );
};

export default Donate;
