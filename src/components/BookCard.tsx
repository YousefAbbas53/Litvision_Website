// import { Link } from "react-router-dom";
// import { Book } from "@/lib/books";
// import { Star } from "lucide-react";

// interface BookCardProps {
//   book: Book;
// }

// const BookCard = ({ book }: BookCardProps) => {
//   return (
//     <Link
//       to={`/book/${book.id}`}
//       className="group block glass-card rounded-xl overflow-hidden hover-lift"
//     >
//       <div className="aspect-[3/4] overflow-hidden">
//         <img
//           src={book.cover}
//           alt={book.title}
//           className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//         />
//       </div>
//       <div className="p-4">
//         <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
//           {book.title}
//         </h3>
//         <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
//         <div className="flex items-center gap-1 mt-2">
//           <Star className="w-4 h-4 fill-amber text-amber" />
//           <span className="text-sm font-medium text-foreground">{book.rating}</span>
//         </div>
//       </div>
//     </Link>
//   );
// };

// export default BookCard;   

import { Link } from "react-router-dom";
import { Book } from "@/lib/books";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface BookCardProps {
  book: Book;
}

const BookCard = ({ book }: BookCardProps) => {
  return (
    <Link to={`/book/${book.id}`}>
      <motion.div
        whileHover={{ scale: 1.08, y: -10 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="group block glass-card rounded-xl overflow-hidden hover-lift cursor-pointer"
      >
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={book.cover}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        <div className="p-4">
          <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
            {book.title}
          </h3>

          <p className="text-sm text-muted-foreground mt-1">
            {book.author}
          </p>

          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 fill-amber text-amber" />
            <span className="text-sm font-medium text-foreground">
              {book.rating}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default BookCard;