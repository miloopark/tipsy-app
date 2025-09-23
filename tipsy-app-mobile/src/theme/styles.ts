import { StyleSheet } from 'react-native';

const colors = {
  background: '#583194',
  card: '#8069b3ff',
  accent: '#FFFF',
  textPrimary: '#F5EEFF',
  textSecondary: 'rgba(245, 238, 255, 0.7)'
};

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'space-between'
  },
  landingContainer: {
    justifyContent: 'flex-start',
    paddingTop: 120,
    gap: 72,
    alignItems: 'center'
  },
  topSection: {
    gap: 16
  },
  heroContainer: {
    gap: 8
  },
  landingHero: {
    alignItems: 'center',
    gap: 16
  },
  logo: {
    fontSize: 112,
    color: colors.accent,
    letterSpacing: 5,
    fontFamily: 'Magic'
  },
  tagline: {
    fontSize: 18,
    color: colors.textPrimary,
    opacity: 0.8,
  },
  taglineCentered: {
    textAlign: 'center'
  },
  form: {
    gap: 12,
    width: '100%'
  },
  input: {
    backgroundColor: colors.card,
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 16,
    width: '100%'
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center'
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background
  },
  secondaryButton: {
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 15
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary
  },
  gameCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    marginTop: 24,
    gap: 8
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent
  },
  gameSubtitle: {
    color: colors.textSecondary
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start'
  },
  backIcon: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 20
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500'
  },
  promptCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 32,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center'
  },
  promptText: {
    color: colors.textPrimary,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28
  }
});
