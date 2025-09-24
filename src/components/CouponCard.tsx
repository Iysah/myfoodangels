import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Coupon } from '../types/Coupon';
import { Colors, Typography, Spacing, BorderRadius, GlobalStyles } from '../styles/globalStyles';

interface CouponCardProps {
  coupon: Coupon;
  onPress?: (coupon: Coupon) => void;
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon, onPress }) => {
  const formatExpirationDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDiscountText = () => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountAmount}% OFF`;
    } else {
      return `₦${coupon.discountAmount} OFF`;
    }
  };

  const isExpiringSoon = () => {
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
    return coupon.expirationDate <= threeDaysFromNow;
  };

  return (
    <TouchableOpacity
      style={[styles.card, isExpiringSoon() && styles.expiringSoonCard]}
      onPress={() => onPress?.(coupon)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{getDiscountText()}</Text>
        </View>
        {isExpiringSoon() && (
          <View style={styles.warningBadge}>
            <Text style={styles.warningText}>Expiring Soon</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.couponName}>{coupon.name}</Text>
        <Text style={styles.purpose}>{coupon.purpose}</Text>
        
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Coupon Code:</Text>
          <Text style={styles.code}>{coupon.code}</Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Min Spend:</Text>
            <Text style={styles.detailValue}>₦{coupon.minSpend}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>
              {coupon.oneTimeUse ? 'One-time use' : 'Multiple use'}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.expirationText}>
            Expires: {formatExpirationDate(coupon.expirationDate)}
          </Text>
        </View>

        {(coupon.applicableCategories.length > 0 || coupon.applicableProducts.length > 0) && (
          <View style={styles.applicabilityContainer}>
            <Text style={styles.applicabilityTitle}>Applicable to:</Text>
            {coupon.applicableCategories.length > 0 && (
              <Text style={styles.applicabilityText}>
                Categories: {coupon.applicableCategories.join(', ')}
              </Text>
            )}
            {coupon.applicableProducts.length > 0 && (
              <Text style={styles.applicabilityText}>
                Products: {coupon.applicableProducts.join(', ')}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  expiringSoonCard: {
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  discountBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  discountText: {
    ...GlobalStyles.h4,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  warningBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  warningText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.white,
  },
  content: {
    padding: Spacing.md,
  },
  couponName: {
    ...GlobalStyles.h3,
    marginBottom: Spacing.xs,
    textTransform: 'capitalize',
  },
  purpose: {
    ...GlobalStyles.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  codeContainer: {
    backgroundColor: Colors.gray.light,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeLabel: {
    ...GlobalStyles.body,
    fontFamily: Typography.fontFamily.medium,
  },
  code: {
    ...GlobalStyles.body,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    ...GlobalStyles.caption,
    marginBottom: Spacing.xs,
  },
  detailValue: {
    ...GlobalStyles.body,
    fontFamily: Typography.fontFamily.medium,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray.light,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  expirationText: {
    ...GlobalStyles.caption,
    textAlign: 'center',
  },
  applicabilityContainer: {
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  applicabilityTitle: {
    ...GlobalStyles.caption,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
  },
  applicabilityText: {
    ...GlobalStyles.caption,
    marginBottom: Spacing.xs,
  },
});

export default CouponCard;