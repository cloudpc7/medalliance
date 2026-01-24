// 🔥 Production Ready
// --- React Core Libraries and Modules ---
import React, { useState, memo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Pressable, 
  Platform 
} from 'react-native';

// --- Expo Libraries and Modules ----
import { FontAwesome6 } from '@expo/vector-icons';

// --- Constants ---
const NO_OP = () => {};

/**
 * ShopCard
 * * A hardened, reusable UI for shop items with localized formatting and A11y.
 */
const ShopCard = ({ 
  itemDetails = {}, 
  onBuy = NO_OP,
  onToggleFavorite = NO_OP,
  onToggleBookmark = NO_OP,
  onIncreaseQty = NO_OP,
  onDecreaseQty = NO_OP,
  currentQty = 1
}) => {
  const [imageIsLoading, setImageIsLoading] = useState(true);

  const { 
    id,
    name = 'Unknown Item', 
    details = 'No description available',
    price = 0, 
    imageURL = 'https://via.placeholder.com/150',
    rating = 0,
    ISBN
  } = itemDetails;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const detailLabel = ISBN ? 'Author' : 'Details';
  const displayRating = typeof rating === 'number' ? rating.toFixed(1) : 'N/A';

  return (
    <View style={styles.mainWrapper} testID={`shop-card-${id}`}>
      <View style={styles.cardContainer}>
        <View style={styles.imageWrapper}>
          <Image
            style={styles.image}
            source={{ uri: imageURL }}
            resizeMode="cover"
            onLoadStart={() => setImageIsLoading(true)}
            onLoadEnd={() => setImageIsLoading(false)}
            accessible={true}
            accessibilityLabel={`${name} product image`} 
          />
          {imageIsLoading && (
            <View style={[styles.imagePlaceholder, StyleSheet.absoluteFill]} />
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.titleText} numberOfLines={2}>
            {name}
          </Text>
          <Text style={styles.detailsText} numberOfLines={2}>
            {detailLabel}: {details}
          </Text>
        </View>

        <View style={styles.controlsContainer}>
          <View style={styles.iconRow}>
            <Pressable 
              style={styles.iconBtn} 
              onPress={() => onToggleBookmark(id)}
              accessibilityRole="button"
              accessibilityLabel={`Bookmark ${name}`}
            >
              <FontAwesome6 name="bookmark" size={24} color="#146EA6" />
            </Pressable>

            <Pressable 
              style={styles.iconBtn} 
              onPress={() => onToggleFavorite(id)}
              accessibilityRole="button"
              accessibilityLabel={`Favorite ${name}`}
            >
              <FontAwesome6 name="heart" size={20} color="#EF4444" />
            </Pressable>
          </View>

          <View style={styles.quantityRow}>
            <Pressable 
              style={styles.qtyBtn} 
              onPress={() => onDecreaseQty(id)}
              accessibilityRole="button"
              accessibilityLabel={`Decrease quantity for ${name}`}
            >
              <FontAwesome6 name="minus" size={16} color="#0D0D0D" />
            </Pressable>
            
            <Text style={styles.qtyText}>
              {currentQty}
            </Text>
            
            <Pressable 
              style={styles.qtyBtn} 
              onPress={() => onIncreaseQty(id)}
              accessibilityRole="button"
              accessibilityLabel={`Increase quantity for ${name}`}
            >
              <FontAwesome6 name="plus" size={16} color="#0D0D0D" />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.footerContainer}>
        <View style={styles.priceRatingContainer}>
          <Text style={styles.priceText}>
            {formatCurrency(price)}
          </Text>
          <View style={styles.ratingRow}>
            <FontAwesome6 name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>
              {displayRating}
            </Text>
          </View>
        </View>

        <Pressable 
          style={({ pressed }) => [
            styles.buyButton, 
            pressed && styles.buyButtonPressed
          ]}
          onPress={() => onBuy(id)}
          accessibilityRole="button"
          accessibilityLabel={`Buy ${name} now`}
          accessibilityHint="Adds to cart and starts checkout"
        >
          <Text style={styles.buyButtonText}>
            BUY NOW
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default memo(ShopCard);

const styles = StyleSheet.create({
  mainWrapper: {
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageWrapper: {
    width: 90,
    height: 130,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#F1F5F9',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  titleText: {
    fontSize: 18,
    fontFamily: 'Prompt-Medium',
    color: '#0D0D0D',
    marginBottom: 6,
    lineHeight: 24,
  },
  detailsText: {
    fontSize: 16,
    fontFamily: 'Roboto',
    color: '#0D0D0D',
    lineHeight: 22,
  },
  controlsContainer: {
    width: 90,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 130,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  iconBtn: {
    padding: 6,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#17A0BF',
    borderRadius: 8,
    width: '100%',
    paddingVertical: 6,
    backgroundColor: '#FFF',
  },
  qtyBtn: {
    paddingHorizontal: 8,
  },
  qtyText: {
    fontSize: 16,
    fontFamily: 'LibreFranklin-Bold',
    color: '#0F172A',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontFamily: 'Prompt-Medium',
    color: '#0D0D0D',
    marginRight: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 16,
    fontFamily: 'LibreFranklin-Medium',
    color: '#92400E',
  },
  buyButton: {
    backgroundColor: '#146EA6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  buyButtonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Prompt-Medium',
    fontSize: 16,
    letterSpacing: 1,
  },
});