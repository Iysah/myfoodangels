import { StyleSheet } from "react-native";
import { theme } from "../config/theme";
import { typography } from "../config/typography";
import { spacing } from "../config/spacing";

export const GLOBALSTYLES = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    wrapper: {
        flex: 1,
        paddingHorizontal: 18,
        paddingTop: 10,
        // backgroundColor: '#FAFAFA'
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm
    },
    header: {
        paddingHorizontal: spacing.md,
        borderBottomColor: '#EDEDED',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        paddingVertical: spacing.md
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    column: {
        justifyContent: 'center'
    },
    card: {
        borderWidth: 1,
        borderColor: '#F1F1F1',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 24
    },
    text: {
        // color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        // marginBottom: 4,
        // marginTop: 5,
    },
    textCenter: {
        textAlign: 'center',
    },
    linkText: {
        color: theme.colors.primary,
        // fontWeight: '6
    },
    iosShadowB: {
        shadowColor: '#000',
        shadowOffset: { width: -20, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 4,  
    },
    iosShadowT: {
        shadowColor: '#000',
        shadowOffset: { width: -20, height: -5 },
        shadowOpacity: 0.03,
        shadowRadius: 4,  
    },
    inputWrapper: {
        borderWidth: 1,
        borderColor: '#D8D8D8',
        borderRadius: 12,
        height: 50,
        paddingHorizontal: 16,
        marginTop: 10
    },
    divider: {
        height: .6,
        width: '100%',
        backgroundColor: '#DDDDDB',
        marginVertical: 10
    },
    label: {
        color: '#1A1A1A',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        marginBottom: 8,
    },
    errorText: {
        color: '#F97066',
        fontSize: 12,
        fontWeight: '400',
    },
    buttonContainer: {
        borderRadius: 25,
        overflow: 'hidden',
        marginTop: 40,
    },
    buttonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100,
        backgroundColor: theme.colors.primary, 
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    skipText: {
        color: '#ffff',
        textAlign: 'center',
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.rounded,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        // marginBottom: theme.spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    icon: {
        color: '#1A1A1A',
        fontSize: 24
    },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        left: 2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
        borderWidth: 2,
        borderColor: '#fff',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
      },
      emptyText: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 10,
        textAlign: 'center'
      },
      refreshBtn: {
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderRadius: theme.borderRadius.rounded,
    
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: theme.colors.primary
      },
      retryText: {
        fontSize: 14,
        color: '#fff'
      },
      loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: theme.colors.text.primary,
    },
})