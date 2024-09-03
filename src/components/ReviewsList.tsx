import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import './ReviewsList.css';
import { getAuth } from 'firebase/auth';
import { Container, Typography, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Tooltip } from '@mui/material';


interface Reply {
  user: string;
  comment: string;
}

interface Review {
  user: string;
  rating: number;
  comment: string;
  timestamp: string;
  replies?: Reply[];
}

interface Product {
  productId: string;
  productName: string;
  productPrice: number;
  productDescription: string;
  productCategory: string;
  productImage: string;
  productSpecCategory: string;
  reviews?: Review[];
  averageRating?: number;
  additionalImages: string[]; 
}

const ReviewsList: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState<{ rating: number; comment: string }>({
    rating: 0,
    comment: '',
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replyComment, setReplyComment] = useState<string>('');
  const [replyIndex, setReplyIndex] = useState<number | null>(null);
  const auth = getAuth();
  const navigate = useNavigate();


  const getCurrentUser = () => {
    const user = auth.currentUser;
    return user ? user.displayName || user.email || user.uid : 'Admin';
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        console.error('L ID du produit est indéfini');
        setLoading(false);
        return;
      }

      try {
        const productDoc = doc(db, 'product', productId);
        const productSnapshot = await getDoc(productDoc);

        if (productSnapshot.exists()) {
          const productData = productSnapshot.data() as Product;
          setProduct(productData);
          setReviews(productData.reviews || []);
        } else {
          console.log('Aucun produit trouvé!');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du produit:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewReview(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleStarClick = (rating: number) => {
    setNewReview(prevState => ({
      ...prevState,
      rating,
    }));
  };

  const submitReview = async () => {
    if (!product || !productId) return;

    const review: Review = {
      user: getCurrentUser(),
      rating: newReview.rating,
      comment: newReview.comment,
      timestamp: new Date().toISOString(),
      replies: [],
    };

    try {
      const productDoc = doc(db, 'product', productId);

      await updateDoc(productDoc, {
        reviews: arrayUnion(review),
      });
      const updatedReviews = [...reviews, review];
      const newAverageRating = calculateAverageRating(updatedReviews);
      await updateDoc(productDoc, {
        reviews: updatedReviews,
        averageRating: newAverageRating,
      });

      setReviews(updatedReviews);
      setNewReview({ rating: 0, comment: '' });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'avis:', error);
    }
  };

  const submitReply = async (index: number) => {
    if (!product || !productId) return;

    const reply: Reply = {
      user: getCurrentUser(),
      comment: replyComment,
    };

    try {
      const updatedReviews = [...reviews];
      if (!updatedReviews[index].replies) {
        updatedReviews[index].replies = [];
      }
      updatedReviews[index].replies?.push(reply);

      const productDoc = doc(db, 'product', productId);
      await updateDoc(productDoc, {
        reviews: updatedReviews,
      });

      setReviews(updatedReviews);
      setReplyComment('');
      setReplyIndex(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réponse:', error);
    }
  };

  const calculateAverageRating = (reviews: Review[]): number => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return totalRating / reviews.length;
  };

  const averageRating = product?.averageRating || calculateAverageRating(reviews);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!product) {
    return <div>Produit non trouvé</div>;
  }
 
  return (
    <div>
    <h3>Liste des avis </h3>
    <div className="product-details-container">
    <div className="afterheader">
        <div className="product-content">
        <div className="product-container1">
  <div className="left-section">
    <img src={product.productImage} alt={product.productName} className="product-image-details" />
    <h1 className="product-name">{product.productName}</h1>
  </div>
  <div className="right-section">
    <div className="product-rating">
      <div className="stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span id="firststar" key={star} className={`star ${averageRating >= star ? 'filled' : ''}`}>★</span>
        ))}
      </div>
    </div>
  </div>
</div>
          <div className="product-details-container">
            <div className="reviews-section">
              {reviews.length === 0 ? (
               <p>Aucun avis pour le moment</p>
              ) : (
                reviews.map((review, index) => (
                <div key={index} className="review">
                <div className="review-header">
                  <p><strong>{review.user}</strong></p>
                  <div className='starXdate'>
                <div className="starsR">
                 {[1, 2, 3, 4, 5].map(star => (
                   <span key={star} className={`starR ${review.rating >= star ? 'filled' : ''}`}>★</span>
                 ))}
                </div>
              <span className="review-date">
                {new Date(review.timestamp).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            </div>
            <p>{review.comment}</p>
            {review.replies && (
              <div className="replies">
                {review.replies.map((reply, replyIndex) => (
                  <div key={replyIndex} className="reply">
                    <p><strong>{reply.user}</strong> </p>
                    <p>{reply.comment}</p>
                  </div>
                ))}
              </div>
            )}
            <button className='envoyer' onClick={() => setReplyIndex(index)}>Répondre</button>
            {replyIndex === index && (
              <div className="reply-form">
                <textarea
                  value={replyComment}
                  onChange={e => setReplyComment(e.target.value)}
                ></textarea>
                <button onClick={() => submitReply(index)}>Envoyer</button>
              </div>
            )}
          </div>
        ))
      )}
      <div className="new-review">
        <h3 className="product-count">Ajouter un avis</h3>
        <div className="stars">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className={`star ${newReview.rating >= star ? 'filled' : ''}`}
              onClick={() => handleStarClick(star)}
            >
              ★
            </span>
          ))}
        </div>
        <div className="reply-form">
        <textarea
          name="comment"
          value={newReview.comment}
          onChange={handleReviewChange}
        ></textarea>
        <button className='envoyer' onClick={submitReview}>Envoyer</button>
        </div>
      </div>
      </div>
      </div>

    </div>
        </div>
      </div>
  </div>
  );
};

export default ReviewsList;
