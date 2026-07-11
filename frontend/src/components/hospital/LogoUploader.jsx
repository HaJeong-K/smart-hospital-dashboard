import { useRef } from "react";

import {
    ImagePlus,
    Trash2,
    Upload,
} from "lucide-react";

function LogoUploader({

    hospital,

    setHospital,

}) {

    const inputRef = useRef(null);

    const uploadLogo = (file) => {

        if (!file) return;

        const url = URL.createObjectURL(file);

        setHospital(prev => ({

            ...prev,

            logo: url,

        }));

    };

    const fileChange = (e) => {

        uploadLogo(

            e.target.files[0]

        );

    };

    const dragOver = (e) => {

        e.preventDefault();

    };

    const drop = (e) => {

        e.preventDefault();

        uploadLogo(

            e.dataTransfer.files[0]

        );

    };

    const removeLogo = () => {

        setHospital(prev => ({

            ...prev,

            logo: null,

        }));

    };

    return (

        <div className="hospital-card">

            <div className="hospital-card-header">

                <ImagePlus size={22} />

                <h2>

                    병원 로고

                </h2>

            </div>

            {

                hospital.logo ? (

                    <div className="logo-preview">

                        <img

                            src={hospital.logo}

                            alt="Hospital Logo"

                        />

                        <button

                            className="logo-remove"

                            onClick={removeLogo}

                        >

                            <Trash2 size={18} />

                            삭제

                        </button>

                    </div>

                ) : (

                    <div

                        className="logo-upload"

                        onDragOver={dragOver}

                        onDrop={drop}

                        onClick={()=>

                            inputRef.current.click()

                        }

                    >

                        <Upload size={46} />

                        <h3>

                            로고 업로드

                        </h3>

                        <p>

                            클릭하거나 이미지를 드래그하세요

                        </p>

                        <small>

                            PNG · JPG · WEBP

                        </small>

                    </div>

                )

            }

            <input

                hidden

                ref={inputRef}

                type="file"

                accept="image/png,image/jpeg,image/webp"

                onChange={fileChange}

            />

        </div>

    );

}

export default LogoUploader;