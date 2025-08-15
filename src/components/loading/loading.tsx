import { Player } from '@lottiefiles/react-lottie-player';

import loading from "../../assets/loader.json";
import { CustomLoadingText } from './customLoadingText';

const Loading = () => {

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <Player
                src={loading}
                className='player'
                loop
                autoplay
                speed={2}
                style={{ height: '300px', width: '300px' }}
                background="transparent"
            />
            <CustomLoadingText text='LOADING...' animationType='bounce' color='white' />
        </div>
    );
};

export default Loading;