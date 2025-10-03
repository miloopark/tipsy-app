import { StyleSheet } from 'react-native';

const colors = {
  background: '#F8F3E6',
  surface: '#E5E3E1',
  accent: '#CA2A3A',
  accentSoft: '#E87A84',
  textPrimary: '#1F1F1F',
  textSecondary: '#7C7C7C',
  border: '#D0CECC',
  shadow: '#D0CECC'
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
    justifyContent: 'flex-end',
    paddingBottom: 80,
    gap: 48
  },
  landingBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  topSection: {
    gap: 16
  },
  heroContainer: {
    gap: 8
  },
  modeTop: {
    gap: 24
  },
  landingHero: {
    alignItems: 'center',
    gap: 12
  },
  tagline: {
    fontSize: 18,
    color: colors.textPrimary,
    opacity: 0.7
  },
  taglineCentered: {
    textAlign: 'center'
  },
  form: {
    gap: 12,
    width: '100%'
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 }
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
    borderColor: colors.border,
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
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginTop: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 }
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent
  },
  gameSubtitle: {
    color: colors.textSecondary
  },
  gamePlaceholder: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 48
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
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 32,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }
  },
  promptText: {
    color: colors.textPrimary,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28
  },
  promptOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(249, 247, 246, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  promptHeading: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center'
  },
  spinStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginTop: 16
  },
  spinCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(202, 42, 58, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  bottleContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinHint: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center'
  },
  playersList: {
    width: '100%',
    gap: 12,
    marginTop: 24
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  playerInitial: {
    fontSize: 18,
    fontWeight: '700'
  },
  playerInput: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  removePlayerButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  removePlayerText: {
    color: colors.textSecondary,
    fontSize: 13
  },
  addPlayerButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center'
  },
  addPlayerText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500'
  },
  modeOptions: {
    width: '100%',
    gap: 18,
    marginTop: 24,
    marginBottom: 32
  },
  modeCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  modeCardSelected: {
    borderColor: colors.accent
  },
  modeTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700'
  },
  modeDescription: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22
  }
});
