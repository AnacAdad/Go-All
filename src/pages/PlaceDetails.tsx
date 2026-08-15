import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';

import type { Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

import { auth, db } from '../config/firebaseConfig';
import { Navbar } from '../components/Navbar';
import type { Place } from '../types';

interface Review {
  id: string;
  placeId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: Timestamp | null;
}

export function PlaceDetails() {
  const { id } = useParams();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [user, setUser] = useState<User | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [isEditingReview, setIsEditingReview] = useState(false);

  // Acompanha o usuário logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Carrega os dados do local
  useEffect(() => {
    const loadPlace = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const placeRef = doc(db, 'places', id);
        const placeSnapshot = await getDoc(placeRef);

        if (placeSnapshot.exists()) {
          setPlace({
            id: placeSnapshot.id,
            ...placeSnapshot.data()
          } as Place);
        }
      } catch (error) {
        console.error('Erro ao carregar local:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlace();
  }, [id]);

  // Carrega as avaliações do local em tempo real
  useEffect(() => {
    if (!id) {
      setReviews([]);
      setLoadingReviews(false);
      return;
    }

    setLoadingReviews(true);

    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('placeId', '==', id)
    );

    const unsubscribe = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const reviewsList = snapshot.docs.map((reviewDoc) => ({
          id: reviewDoc.id,
          ...reviewDoc.data()
        })) as Review[];

        // Ordena das avaliações mais recentes para as mais antigas
        reviewsList.sort((a, b) => {
          const dateA = a.createdAt?.toMillis() ?? 0;
          const dateB = b.createdAt?.toMillis() ?? 0;

          return dateB - dateA;
        });

        setReviews(reviewsList);
        setLoadingReviews(false);
      },
      (error) => {
        console.error('Erro ao carregar avaliações:', error);
        setLoadingReviews(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [id]);

  // Calcula a média das avaliações
  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (total, review) => total + review.rating,
          0
        ) / reviews.length
      : 0;

  // Procura a avaliação feita pelo usuário atual
  const userReview = user
    ? reviews.find(
        (review) => review.userId === user.uid
      ) || null
    : null;

  // Publicar ou editar avaliação
  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Você precisa estar logado para avaliar este local.');
      return;
    }

    if (!id) {
      return;
    }

    if (rating < 1 || rating > 5) {
      alert('Escolha uma nota de 1 a 5 estrelas.');
      return;
    }

    if (!comment.trim()) {
      alert('Escreva um comentário sobre o local.');
      return;
    }

    setIsSubmittingReview(true);

    try {
      // =========================
      // EDITAR AVALIAÇÃO
      // =========================
      if (isEditingReview && userReview) {
        const reviewRef = doc(
          db,
          'reviews',
          userReview.id
        );

        await updateDoc(reviewRef, {
          rating,
          comment: comment.trim(),
          updatedAt: serverTimestamp()
        });

        alert('Avaliação atualizada com sucesso!');

        setRating(0);
        setComment('');
        setIsEditingReview(false);

        return;
      }

      // =========================
      // VERIFICAR DUPLICIDADE
      // =========================
      const existingReviewQuery = query(
        collection(db, 'reviews'),
        where('placeId', '==', id),
        where('userId', '==', user.uid)
      );

      const existingReviews = await getDocs(
        existingReviewQuery
      );

      if (!existingReviews.empty) {
        alert('Você já avaliou este local.');
        return;
      }

      // =========================
      // CRIAR NOVA AVALIAÇÃO
      // =========================
      const reviewId = `${id}_${user.uid}`;

      const reviewRef = doc(
        db,
        'reviews',
        reviewId
      );

      await setDoc(reviewRef, {
        placeId: id,
        userId: user.uid,
        userName:
          user.displayName ||
          user.email?.split('@')[0] ||
          'Usuário',
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp()
      });

      alert('Avaliação publicada com sucesso!');

      setRating(0);
      setComment('');

    } catch (error) {
      console.error(
        'Erro ao salvar avaliação:',
        error
      );

      alert(
        'Não foi possível salvar sua avaliação.'
      );

    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />

        <div className="flex items-center justify-center py-20">
          <p className="text-slate-300">
            Carregando local...
          </p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />

        <div className="max-w-4xl mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Local não encontrado
          </h1>

          <Link
            to="/"
            className="text-indigo-400 hover:text-indigo-300"
          >
            Voltar para o mapa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />

      <main className="max-w-4xl mx-auto p-4 md:p-8">

        <Link
          to="/"
          className="inline-block text-indigo-400 hover:text-indigo-300 mb-6"
        >
          ← Voltar para o mapa
        </Link>

        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-xl">

          {/* Categoria */}
          <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-sm font-medium mb-4">
            {place.category || 'Local'}
          </span>

          {/* Nome */}
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {place.name}
          </h1>

          {/* Endereço */}
          <p className="text-slate-400 mb-6">
            📍 {place.address}
          </p>

          {/* Média das avaliações */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">
              Avaliação
            </h2>

            {averageRating > 0 ? (
              <div>
                <p className="text-yellow-400 text-xl font-semibold">
                  ⭐ {averageRating.toFixed(1)}
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  {reviews.length}{' '}
                  {reviews.length === 1
                    ? 'avaliação'
                    : 'avaliações'}
                </p>
              </div>
            ) : (
              <p className="text-slate-400">
                Este local ainda não possui avaliações.
              </p>
            )}
          </div>

          {/* Recursos de acessibilidade */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Recursos de acessibilidade
            </h2>

            {place.verifiedFeatures?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {place.verifiedFeatures.map(
                  (feature) => (
                    <span
                      key={feature}
                      className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-4 py-2 rounded-xl"
                    >
                      ✓ {feature}
                    </span>
                  )
                )}
              </div>
            ) : (
              <p className="text-slate-400">
                Nenhum recurso de acessibilidade informado.
              </p>
            )}
          </div>

          {/* Avaliações da comunidade */}
          <div className="mt-10 border-t border-slate-700 pt-6">

            <h2 className="text-xl font-semibold mb-5">
              Avaliações da comunidade
            </h2>

            {loadingReviews ? (
              <p className="text-slate-400">
                Carregando avaliações...
              </p>
            ) : reviews.length === 0 ? (
              <p className="text-slate-400">
                Nenhuma avaliação publicada ainda.
              </p>
            ) : (
              <div className="space-y-4">

                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5"
                  >

                    <div className="flex justify-between items-start gap-4">

                      <div>
                        <p className="font-semibold text-slate-200">
                          {review.userName}
                        </p>

                        <div className="flex mt-1">
                          {[1, 2, 3, 4, 5].map(
                            (star) => (
                              <span
                                key={star}
                                className={
                                  star <= review.rating
                                    ? 'text-yellow-400'
                                    : 'text-slate-600'
                                }
                              >
                                ★
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {review.createdAt && (
                        <span className="text-xs text-slate-500">
                          {review.createdAt
                            .toDate()
                            .toLocaleDateString(
                              'pt-BR'
                            )}
                        </span>
                      )}

                    </div>

                    <p className="text-slate-300 mt-4 leading-relaxed">
                      {review.comment}
                    </p>

                  </div>
                ))}

              </div>
            )}

          </div>

          {/* Avaliação do usuário */}
          <div className="mt-10 border-t border-slate-700 pt-6">

            <h2 className="text-xl font-semibold mb-4">
              {userReview && !isEditingReview
                ? 'Sua avaliação'
                : isEditingReview
                  ? 'Editar minha avaliação'
                  : 'Avaliar este local'}
            </h2>

            {!user ? (
              <div>
                <p className="text-slate-400">
                  Faça login para avaliar este local.
                </p>

                <Link
                  to="/login"
                  className="inline-block mt-3 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl transition-colors"
                >
                  Entrar
                </Link>
              </div>

            ) : loadingReviews ? (

              <p className="text-slate-400">
                Verificando sua avaliação...
              </p>

            ) : userReview && !isEditingReview ? (

              /* Usuário já avaliou */
              <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-5">

                <div className="flex gap-1 mb-3">

                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <span
                        key={star}
                        className={
                          star <= userReview.rating
                            ? 'text-yellow-400 text-xl'
                            : 'text-slate-600 text-xl'
                        }
                      >
                        ★
                      </span>
                    )
                  )}

                </div>

                <p className="text-slate-300 mb-4">
                  {userReview.comment}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setRating(userReview.rating);
                    setComment(userReview.comment);
                    setIsEditingReview(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Editar minha avaliação
                </button>

              </div>

            ) : (

              /* Nova avaliação ou edição */
              <form
                onSubmit={handleReview}
                className="space-y-5"
              >

                <div>
                  <p className="text-sm text-slate-300 mb-2">
                    {isEditingReview
                      ? 'Altere sua nota'
                      : 'Qual é a sua avaliação?'}
                  </p>

                  <div className="flex gap-2">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setRating(star)
                          }
                          className={`text-3xl transition-transform hover:scale-110 cursor-pointer ${
                            star <= rating
                              ? 'text-yellow-400'
                              : 'text-slate-600'
                          }`}
                        >
                          ★
                        </button>
                      )
                    )}

                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    {isEditingReview
                      ? 'Edite seu comentário'
                      : 'Conte como foi sua experiência'}
                  </label>

                  <textarea
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value)
                    }
                    rows={4}
                    placeholder="Ex: A entrada possui rampa e o banheiro é acessível..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 flex-wrap">

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-medium px-6 py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    {isSubmittingReview
                      ? 'Salvando...'
                      : isEditingReview
                        ? 'Salvar alterações'
                        : 'Publicar avaliação'}
                  </button>

                  {isEditingReview && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingReview(false);
                        setRating(0);
                        setComment('');
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}

                </div>

              </form>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}