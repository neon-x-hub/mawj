const MaskedIcon = ({
    src,
    color,
    className = 'w-6 h-6',
    height = '25px',
    width = '25px',
    ...props
}) => {
    return (
        <div
            className={className}
            style={{
                WebkitMaskImage: `url(${src})`,
                maskImage: `url(${src})`,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                backgroundColor: color,
                width: width,
                height: height,
            }}
            {...props}
        />
    );
};

export default MaskedIcon;
